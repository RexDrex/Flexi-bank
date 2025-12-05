import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, LogOut, User, Shield, Zap, Phone, CreditCard, Wallet } from "lucide-react";
import { TransferModal } from "@/components/Banking/TransferModal";
import { TransactionList } from "@/components/Banking/TransactionList";
import { KYCBanner } from "@/components/Banking/KYCBanner";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setUser(session.user);
      fetchUserData(session.user.id);
    }
  };

  const fetchUserData = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: accountData } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("currency", "NGN")
      .single();

    setProfile(profileData);
    setAccount(accountData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(balance);
  };

  if (!user || !profile || !account) {
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
          <h1 className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            FlexiBank
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/kyc")}>
              <Shield className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <KYCBanner kycStatus={profile.kyc_status} />

        <Card className="shadow-float border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Balance
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-display font-bold">
                {showBalance ? formatBalance(parseFloat(account.balance)) : "••••••"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Account: {account.account_number}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                className="w-full"
                onClick={() => setShowTransferModal(true)}
                disabled={profile.kyc_status !== "approved"}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Send Money
              </Button>
              <Button variant="outline" className="w-full">
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Request Money
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="shadow-float border-border/50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/pay-bills")}
          >
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Pay Bills</h3>
                <p className="text-sm text-muted-foreground">Electricity, Cable, Water</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-float border-border/50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/buy-airtime")}
          >
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Buy Airtime</h3>
                <p className="text-sm text-muted-foreground">Top up your phone</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-float border-border/50 cursor-pointer hover:shadow-lg transition-shadow opacity-50"
          >
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Cards</h3>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-float border-border/50 cursor-pointer hover:shadow-lg transition-shadow opacity-50"
          >
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Savings</h3>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <TransactionList accountId={account.id} />
      </main>

      <TransferModal
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        senderAccountId={account.id}
        onSuccess={() => {
          fetchUserData(user.id);
          setShowTransferModal(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
