"use client";

import { useRouter } from "next/navigation";

const LogOutBtn = () => {
  const router = useRouter();
  const logoutFunction = async () => {
    const request = await fetch(`/api/user/log-out`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await request.json();
    if (result.success) {
      alert(result.message);
      router.replace("/");
      router.refresh();
    } else {
      alert(result.message);
    }
  };
  return <button onClick={logoutFunction}>Log Out</button>;
};

export default LogOutBtn;
