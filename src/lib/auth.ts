import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ログインスキーマ
const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上である必要があります"),
});

// 登録スキーマ
const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上である必要があります"),
  handle_name: z
    .string()
    .min(1, "ハンドル名を入力してください")
    .max(100, "ハンドル名は100文字以内である必要があります"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        handle_name: { label: "Handle Name", type: "text" }, // 登録時のみ使用
        action: { label: "Action", type: "hidden" }, // "login" または "register"
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const action = credentials.action || "login";

          if (action === "register") {
            // 登録処理
            const validatedFields = registerSchema.parse({
              email: credentials.email,
              password: credentials.password,
              handle_name: credentials.handle_name,
            });

            // 既存ユーザーチェック
            const existingUser = await sql`
              SELECT id FROM users WHERE email = ${validatedFields.email}
            `;

            if (existingUser.length > 0) {
              throw new Error("このメールアドレスは既に登録されています");
            }

            // パスワードハッシュ化
            const hashedPassword = await bcrypt.hash(
              validatedFields.password,
              12,
            );

            // ユーザー作成
            const newUser = await sql`
              INSERT INTO users (email, password_hash, handle_name)
              VALUES (${validatedFields.email}, ${hashedPassword}, ${validatedFields.handle_name})
              RETURNING id, email, handle_name, created_at
            `;

            return {
              id: newUser[0].id,
              email: newUser[0].email,
              name: newUser[0].handle_name,
            };
          } else {
            // ログイン処理
            const validatedFields = loginSchema.parse({
              email: credentials.email,
              password: credentials.password,
            });

            // ユーザー検索
            const user = await sql`
              SELECT id, email, password_hash, handle_name
              FROM users
              WHERE email = ${validatedFields.email}
            `;

            if (user.length === 0) {
              throw new Error(
                "メールアドレスまたはパスワードが正しくありません",
              );
            }

            // パスワード検証
            const isValidPassword = await bcrypt.compare(
              validatedFields.password,
              user[0].password_hash,
            );

            if (!isValidPassword) {
              throw new Error(
                "メールアドレスまたはパスワードが正しくありません",
              );
            }

            return {
              id: user[0].id,
              email: user[0].email,
              name: user[0].handle_name,
            };
          }
        } catch (error) {
          console.error("認証エラー:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.handle_name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.handle_name = token.handle_name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
