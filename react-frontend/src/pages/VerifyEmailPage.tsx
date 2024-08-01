import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const response = await api.get("/auth/verifyemail/" + token);
        setIsValid(response.data.validated);
      } catch (e) {
        console.log(e);
        console.log("failed to verify email");
        setIsValid(false);
      }
      setLoading(false);
    })();
  }, [token]);

  return (
    <Card className="mx-auto p-6 mt-6 text-center w-fit">
      {loading ? (
        <Loader2 className="animate-spin mx-auto text-primary" />
      ) : (
        <>
          <h1 className="text-3xl text-center mb-6">
            {isValid ? "Your Email has been verified!" : "oops! Invalid Token"}
          </h1>

          <Link to={"/login"}>
            <Button variant={"outline"}>
              <ChevronLeft className="mr-2" />
              Back to Login
            </Button>
          </Link>
        </>
      )}
    </Card>
  );
};

export default VerifyEmailPage;
