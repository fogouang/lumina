import LoadingSpinner from "@/components/shared/LoadingSpinner";
import CallBackContent from "@/components/subcriptions/CallBackContent";
import { Suspense } from "react";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CallBackContent />
    </Suspense>
  );
}
