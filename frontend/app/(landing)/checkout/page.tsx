import LoadingSpinner from "@/components/shared/LoadingSpinner";
import CheckoutContent from "@/components/subcriptions/CheckoutContent";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}
