import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertCircle, Clock } from "lucide-react";

interface KYCBannerProps {
  kycStatus: "pending" | "under_review" | "approved" | "rejected";
}

export const KYCBanner = ({ kycStatus }: KYCBannerProps) => {
  const navigate = useNavigate();

  if (kycStatus === "approved") return null;

  const bannerConfig = {
    pending: {
      icon: AlertCircle,
      title: "Verify Your Account",
      description: "Complete KYC verification to unlock all features including money transfers",
      variant: "default" as const,
      buttonText: "Start Verification",
    },
    under_review: {
      icon: Clock,
      title: "Verification in Progress",
      description: "Your documents are being reviewed. This usually takes 24-48 hours.",
      variant: "default" as const,
      buttonText: "View Status",
    },
    rejected: {
      icon: AlertCircle,
      title: "Verification Failed",
      description: "Your KYC verification was rejected. Please review and resubmit.",
      variant: "destructive" as const,
      buttonText: "Resubmit",
    },
  };

  const config = bannerConfig[kycStatus];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className="shadow-soft">
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">{config.description}</span>
        <Button
          size="sm"
          variant={kycStatus === "rejected" ? "destructive" : "default"}
          onClick={() => navigate("/kyc")}
          className="ml-4"
        >
          <Shield className="w-4 h-4 mr-2" />
          {config.buttonText}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
