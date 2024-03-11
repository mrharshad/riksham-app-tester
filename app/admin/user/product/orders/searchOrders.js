"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

const SearchOrders = ({ Fragment, page }) => {
  const router = useRouter();
  const key = useRef("");
  const search = (e) => {
    e.preventDefault();
    const value = key.current.value;
    router.replace(`?status=delivered&page=${page}&key=${value}`);
  };
  return (
    <form onSubmit={search}>
      <input
        required
        minLength={3}
        placeholder="Delivered Orders..."
        type="text"
        ref={key}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchOrders;
