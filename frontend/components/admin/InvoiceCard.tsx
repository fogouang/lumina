import { Download, Eye, FileText } from "lucide-react";
import { InvoiceResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DateDisplay from "@/components/shared/DateDisplay";

interface InvoiceCardProps {
  invoice: InvoiceResponse;
  onViewPayment?: (paymentId: string) => void;
}

export default function InvoiceCard({ invoice, onViewPayment }: InvoiceCardProps) {
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
            <CardTitle className="text-base">
              Facture #{invoice.invoice_number}
            </CardTitle>
            <CardDescription>
              <DateDisplay date={invoice.payment_date} />
            </CardDescription>
          </div>
          {onViewPayment && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewPayment(invoice.payment_id)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Paiement
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Montant */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Montant</span>
          <span className="text-lg font-bold">{invoice.amount.toLocaleString()} FCFA</span>
        </div>

        {/* Méthode de paiement */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Méthode</span>
          <Badge variant="outline">
            {getPaymentMethodLabel(invoice.payment_method)}
          </Badge>
        </div>

        {/* Client */}
        {invoice.customer_name && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{invoice.customer_name}</span>
          </div>
        )}

        {/* Email */}
        {invoice.customer_email && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="text-xs">{invoice.customer_email}</span>
          </div>
        )}

        {/* Description produit */}
        <div className="text-sm bg-muted p-2 rounded">
          <p className="font-medium mb-1">Produit:</p>
          <p className="text-muted-foreground text-xs">{invoice.product_description}</p>
        </div>

        {/* Télécharger PDF */}
        {invoice.invoice_url && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={invoice.invoice_url} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}