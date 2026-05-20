import type { Metadata } from "next";
import OmsShell from "./_components/OmsShell";
import "./oms.css";

export const metadata: Metadata = {
  title: "Budomex OMS",
};

const themeInitScript = `
try {
  var t = localStorage.getItem('bdx-oms-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

export default function OmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <OmsShell>{children}</OmsShell>
    </>
  );
}
