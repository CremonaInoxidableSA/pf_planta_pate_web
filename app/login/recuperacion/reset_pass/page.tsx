import ResetPassword from "./ResetPassword";

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return <ResetPassword initialToken={token} />;
}
