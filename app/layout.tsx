import ForceTabTitle from "@/components/force-tab-title";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ForceTabTitle />
      {children}
    </>
  );
}
