"use client";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { FcGoogle } from "react-icons/fc";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { RegisterFormSchema, RegisterFormType } from "@/lib/RegisterFormSchema";
import { useForm } from "react-hook-form";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import ErrorAlert from "./ErrorAlert";
import SuccessAlert from "./SuccessAlert";

import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { useSearchParams } from "react-router-dom";
import { baseURL } from "@/baseURL";

const RegisterForm = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchParams, _setSearchParams] = useSearchParams();

  const form = useForm<RegisterFormType>({
    shouldUnregister: false,
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (searchParams.get("credentials") === "true") {
      setSuccessMsg(null);
      setErrorMsg(
        "Email already registered with Email and Password credentials"
      );
    }
  }, []);

  const onSubmit = useCallback(async (data: RegisterFormType) => {
    const { username, email, password } = data;
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      setErrorMsg(null);
      setSuccessMsg(response.data.message);
    } catch (e) {
      if (e instanceof AxiosError) {
        setSuccessMsg(null);
        setErrorMsg(e.response?.data.message || "Unable to register");
        ///maybe case when passport sends own response not containing message
      }
    }
  }, []);

  return (
    <Card>
      <CardContent className="mt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 flex flex-col"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="xyz@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errorMsg ? <ErrorAlert>{errorMsg}</ErrorAlert> : null}
            {successMsg ? <SuccessAlert>{successMsg}</SuccessAlert> : null}

            <Button
              disabled={form.formState.isSubmitting}
              className=" w-full text-foreground hover:bg-primary-foreground"
              type="submit"
            >
              Register
              {form.formState.isSubmitting ? (
                <LoaderCircle className="animate-spin ml-2" />
              ) : null}
            </Button>

            <div className="flex items-center w-full">
              <Separator className="w-[45%] mr-2" />
              <p className="text-muted-foreground">or</p>
              <Separator className="w-[45%] ml-2" />
            </div>
          </form>
        </Form>
        <Button
          onClick={() => (window.location.href = baseURL + "/api/auth/google")}
          className="w-full mt-2"
          variant={"secondary"}
        >
          <FcGoogle className=" text-2xl mr-2 " />

          <p>Sign in with Google</p>
        </Button>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
