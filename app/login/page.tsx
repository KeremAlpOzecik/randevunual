import { redirect } from "next/navigation";

/** Eski URL — Türkçe giriş sayfasına yönlendir */
export default function LoginRedirectPage() {
  redirect("/giris");
}
