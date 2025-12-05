import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Phone } from "lucide-react";

const networks = [
  { id: "mtn", name: "MTN", color: "bg-yellow-500" },
  { id: "glo", name: "Glo", color: "bg-green-500" },
  { id: "airtel", name: "Airtel", color: "bg-red-500" },
  { id: "9mobile", name: "9mobile", color: "bg-emerald-600" },
];

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

const BuyAirtime = () => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: accountData } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("currency", "NGN")
        .single();

      setAccount(accountData);
    } catch (error) {
      console.error("Error fetching account:", error);
      toast.error("Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!network || !phoneNumber || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount < 50) {
      toast.error("Minimum amount is ₦50");
      return;
    }

    if (account.balance < purchaseAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);

    try {
      const reference = `AIRTIME-${Date.now()}`;

      const { error: txnError } = await supabase.from("transactions").insert([{
        sender_account_id: account.id,
        amount: purchaseAmount,
        currency: "NGN",
        transaction_type: "withdrawal" as const,
        status: "completed" as const,
        reference,
        description: `Airtime - ${network.toUpperCase()} - ${phoneNumber}`,
        completed_at: new Date().toISOString(),
      }]);

      if (txnError) throw txnError;

      const newBalance = account.balance - purchaseAmount;
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (updateError) throw updateError;

      toast.success("Airtime purchased successfully!");
      setNetwork("");
      setPhoneNumber("");
      setAmount("");
      fetchAccount();
    } catch (error) {
      console.error("Error processing purchase:", error);
      toast.error("Purchase failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            Buy Airtime
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="shadow-float border-border/50">
          <CardHeader>
            <CardTitle>Select Network</CardTitle>
            <CardDescription>Choose your mobile network provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {networks.map((net) => (
                <Button
                  key={net.id}
                  variant={network === net.id ? "default" : "outline"}
                  className="h-16 text-lg font-semibold"
                  onClick={() => setNetwork(net.id)}
                >
                  {net.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {network && (
          <Card className="shadow-float border-border/50">
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
              <CardDescription>Enter phone number and amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    placeholder="08012345678"
                    className="pl-10"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (min. ₦50)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amt.toString())}
                    >
                      ₦{amt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available Balance:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(account.balance)}
                  </span>
                </div>
                <Button onClick={handlePurchase} disabled={processing} className="w-full">
                  {processing ? "Processing..." : "Buy Airtime"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default BuyAirtime;
