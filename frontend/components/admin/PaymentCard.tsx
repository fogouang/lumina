import { Download, Eye, FileText } from "lucide-react";
import { PaymentStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shared/StatusBadge";
import DateDisplay from "@/components/shared/DateDisplay";
import { PaymentResponse } from "@/lib/types/extended";

interface PaymentCardProps {
  payment: PaymentResponse;
  onView: (paymentId: string) => void;
  onGenerateInvoice?: (paymentId: string) => void;
}

export default function PaymentCard({
  payment,
  onView,
  onGenerateInvoice,
}: PaymentCardProps) {
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      mobile_money: "Mobile Money",
      card: "Carte bancaire",
      bank_transfer: "Virement bancaire",
    };
    return labels[method] || method;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-xs text-muted-foreground">Paiement</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {payment.id.slice(0, 8)}...
              </code>
            </CardTitle>
            <CardDescription>
              <DateDisplay date={payment.created_at} />
            </CardDescription>
          </div>
          <StatusBadge status={payment.payment_status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Montant</span>
          <span className="text-lg font-bold">
            {payment.amount.toLocaleString()} FCFA
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Méthode</span>
          <Badge variant="outline">
            {getPaymentMethodLabel(payment.payment_method)}
          </Badge>
        </div>

        {payment.transaction_reference && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Référence</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {payment.transaction_reference}
            </code>
          </div>
        )}

        {payment.invoice_number && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Facture</span>
            <span className="font-medium">#{payment.invoice_number}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(payment.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Détails
          </Button>

          {payment.invoice_url ? (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={payment.invoice_url} download>
                <Download className="mr-2 h-4 w-4" />
                Facture
              </a>
            </Button>
          ) : (
            onGenerateInvoice &&
            payment.payment_status === PaymentStatus.COMPLETED && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onGenerateInvoice(payment.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Générer
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
