"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PullitrNavigation({
  prevId,
  nextId,
}: {
  prevId: string;
  nextId: string;
}) {
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") router.push(`/pullitr/${prevId}`);
      if (e.key === "ArrowRight") router.push(`/pullitr/${nextId}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);
  return null;
}
