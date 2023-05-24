import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/auth/signin");
    },
  });

  useEffect(() => {
    if (data) {
      router.replace("/home");
    }
  }, [data, router]);

  return <div></div>;
}
