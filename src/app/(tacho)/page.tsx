import { redirect } from "next/navigation";

/** Startseite: Weiterleitung auf Standard-Tab Fahrerkarten */
export default function TachoHomePage() {
  redirect("/fahrerkarten");
}
