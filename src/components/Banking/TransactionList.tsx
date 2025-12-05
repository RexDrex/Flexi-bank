import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  sender_account_id: string | null;
  receiver_account_id: string | null;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

interface TransactionListProps {
  accountId: string;
}

export const TransactionList = ({ accountId }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId]);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_account_id.eq.${accountId},receiver_account_id.eq.${accountId}`)
      .order("created_at", { ascending: false })
      .limit(10);

    setTransactions(data || []);
    setLoading(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => {
              const isReceiving = txn.receiver_account_id === accountId;
              return (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-smooth"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isReceiving
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-red-100 dark:bg-red-900/20"
                    }`}
                  >
                    {isReceiving ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {txn.description || (isReceiving ? "Money Received" : "Money Sent")}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(txn.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        isReceiving ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isReceiving ? "+" : "-"}
                      {formatAmount(parseFloat(txn.amount.toString()))}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{txn.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
