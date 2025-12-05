import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Zap, Tv, Wifi, Droplet } from "lucide-react";

const billCategories = [
  { id: "electricity", name: "Electricity", icon: Zap },
  { id: "cable", name: "Cable TV", icon: Tv },
  { id: "internet", name: "Internet", icon: Wifi },
  { id: "water", name: "Water", icon: Droplet },
];

const PayBills = () => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
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

  const handlePayment = async () => {
    if (!category || !provider || !accountNumber || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (account.balance < paymentAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);

    try {
      const reference = `BILL-${Date.now()}`;

      const { error: txnError } = await supabase.from("transactions").insert([{
        sender_account_id: account.id,
        amount: paymentAmount,
        currency: "NGN",
        transaction_type: "withdrawal" as const,
        status: "completed" as const,
        reference,
        description: `${category.toUpperCase()} - ${provider} - ${accountNumber}`,
        completed_at: new Date().toISOString(),
      }]);

      if (txnError) throw txnError;

      const newBalance = account.balance - paymentAmount;
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (updateError) throw updateError;

      toast.success("Bill payment successful!");
      setCategory("");
      setProvider("");
      setAccountNumber("");
      setAmount("");
      fetchAccount();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
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
            Pay Bills
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="shadow-float border-border/50">
          <CardHeader>
            <CardTitle>Select Bill Category</CardTitle>
            <CardDescription>Choose the type of bill you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {billCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={category === cat.id ? "default" : "outline"}
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => setCategory(cat.id)}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{cat.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {category && (
          <Card className="shadow-float border-border/50">
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
              <CardDescription>Enter your bill payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Service Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {category === "electricity" && (
                      <>
                        <SelectItem value="EKEDC">Eko Electricity (EKEDC)</SelectItem>
                        <SelectItem value="IKEDC">Ikeja Electric (IKEDC)</SelectItem>
                        <SelectItem value="AEDC">Abuja Electricity (AEDC)</SelectItem>
                      </>
                    )}
                    {category === "cable" && (
                      <>
                        <SelectItem value="DSTV">DSTV</SelectItem>
                        <SelectItem value="GOTV">GOTV</SelectItem>
                        <SelectItem value="Startimes">Startimes</SelectItem>
                      </>
                    )}
                    {category === "internet" && (
                      <>
                        <SelectItem value="Spectranet">Spectranet</SelectItem>
                        <SelectItem value="Smile">Smile</SelectItem>
                        <SelectItem value="Swift">Swift</SelectItem>
                      </>
                    )}
                    {category === "water" && (
                      <>
                        <SelectItem value="Lagos Water">Lagos Water Corporation</SelectItem>
                        <SelectItem value="FCT Water">FCT Water Board</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account/Meter Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter your account or meter number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
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
                <Button onClick={handlePayment} disabled={processing} className="w-full">
                  {processing ? "Processing..." : "Pay Bill"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PayBills;
