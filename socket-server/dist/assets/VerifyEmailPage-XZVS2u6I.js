import{e as l,u as m,r as s,a as d,j as e,L as f,B as x}from"./index-4MMvhHEo.js";import{C as u,L as h}from"./card-L_1ZyKZj.js";/**
 * @license lucide-react v0.416.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=l("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]),L=()=>{const[o]=m(),a=o.get("token"),[n,r]=s.useState(!1),[i,c]=s.useState(!0);return s.useEffect(()=>{(async()=>{if(a){try{const t=await d.get("/auth/verifyemail/"+a);r(t.data.validated)}catch(t){console.log(t),console.log("failed to verify email"),r(!1)}c(!1)}})()},[a]),e.jsx(u,{className:"mx-auto p-6 mt-6 text-center w-fit",children:i?e.jsx(h,{className:"animate-spin mx-auto text-primary"}):e.jsxs(e.Fragment,{children:[e.jsx("h1",{className:"text-3xl text-center mb-6",children:n?"Your Email has been verified!":"oops! Invalid Token"}),e.jsx(f,{to:"/login",children:e.jsxs(x,{variant:"outline",children:[e.jsx(p,{className:"mr-2"}),"Back to Login"]})})]})})};export{L as default};
