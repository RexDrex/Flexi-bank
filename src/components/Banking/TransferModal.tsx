import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  senderAccountId: string;
  onSuccess: () => void;
}

export const TransferModal = ({ open, onClose, senderAccountId, onSuccess }: TransferModalProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find receiver account
      const { data: receiverAccount, error: receiverError } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_number", accountNumber)
        .single();

      if (receiverError || !receiverAccount) {
        toast.error("Account not found");
        setLoading(false);
        return;
      }

      // Get sender account
      const { data: senderAccount } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", senderAccountId)
        .single();

      if (!senderAccount) {
        toast.error("Your account not found");
        setLoading(false);
        return;
      }

      const transferAmount = parseFloat(amount);

      // Check balance
      if (senderAccount.balance < transferAmount) {
        toast.error("Insufficient balance");
        setLoading(false);
        return;
      }

      // Create transaction
      const reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: txnError } = await supabase.from("transactions").insert({
        sender_account_id: senderAccountId,
        receiver_account_id: receiverAccount.id,
        amount: transferAmount,
        currency: "NGN",
        transaction_type: "transfer",
        status: "completed",
        description: description || "Transfer",
        reference,
        completed_at: new Date().toISOString(),
      });

      if (txnError) throw txnError;

      // Update balances
      const newSenderBalance = senderAccount.balance - transferAmount;
      const newReceiverBalance = receiverAccount.balance + transferAmount;

      await supabase
        .from("accounts")
        .update({ balance: newSenderBalance })
        .eq("id", senderAccountId);

      await supabase
        .from("accounts")
        .update({ balance: newReceiverBalance })
        .eq("id", receiverAccount.id);

      toast.success("Transfer successful!");
      setAccountNumber("");
      setAmount("");
      setDescription("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>Transfer money to another account</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="3012345678"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="1000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Send Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
