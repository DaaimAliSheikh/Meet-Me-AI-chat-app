import RegisterForm from "@/components/RegisterForm";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <div className="p-1 max-w-[35rem]   w-full  flex flex-col  mx-auto mt-6">
      <h2 className="text-xl p-1 py-2">Register</h2>
      <RegisterForm />
      <Link
        to={"/login"}
        className="text-sm text-muted-foreground text-center  underline my-4"
      >
        Already have an account? Sign In
      </Link>
    </div>
  );
};

export default RegisterPage;
