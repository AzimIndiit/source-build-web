import{a as S,g as R,r as m,j as e,K as h,N as p,S as a,B as y}from"./index-CUSVstqU.js";import{u as X,a as L,C as f}from"./useCmsMutations-BaHNA7Xh.js";import{f as O}from"./date-utils-CIparGJB.js";import{P as A}from"./pen-DY7MLpXg.js";const n=`
Last Updated: 27 Aug 2025

Welcome to Source Build. These Terms & Conditions ("Terms") govern your use of our website, mobile application, and services (collectively, the “Platform”). By accessing or using our Platform, you agree to be bound by these Terms.

1. Eligibility

You must be at least 18 years old to use our Platform.
By registering, you confirm that the information provided is true and accurate.

2. Products & Orders

We sell furniture, appliances, and related goods.
Product descriptions, images, and specifications are provided for reference. While we aim for accuracy, slight variations may occur.
Placing an order does not guarantee acceptance. We reserve the right to cancel or refuse orders at our discretion.

3. Pricing & Payments

Prices are listed in currency.
We reserve the right to change prices without prior notice.
Payments must be made via approved methods on our Platform (e.g., credit card, debit card, UPI, net banking, wallet, etc.).

4. Shipping & Delivery

Delivery timelines are estimates and may vary due to factors beyond our control.
Ownership of goods passes to you once the product is delivered.
You must inspect items upon delivery and report any damage within 48 hours.

5. Returns & Refunds

Eligible items may be returned within X days of delivery, subject to our Return Policy.
Refunds will be processed via the original payment method within X business days.
Customized or used items may not be eligible for return.

6. User Responsibilities

You agree not to misuse the Platform, engage in fraud, or violate applicable laws.
You are responsible for maintaining account confidentiality.

7. Intellectual Property

All content, trademarks, and materials on Source Build are owned by us or our licensors.
You may not copy, reproduce, or distribute without written permission.

8. Limitation of Liability

We are not liable for indirect, incidental, or consequential damages arising from your use of our Platform.
Product warranties (if applicable) are provided by manufacturers.

9. Governing Law

These Terms shall be governed by the laws of Your Country/State.
Any disputes shall be subject to the jurisdiction of courts in City, Country.

10. Changes to Terms

We reserve the right to update these Terms at any time. Continued use of the Platform indicates your acceptance of the updated Terms.

11. Contact Us

For questions, contact us at:
📧 Email: support@sourcebuild.com
📞 Phone: +91-XXXXXXXXXX`,B=()=>{const o=S(),x=o.pathname==="/terms"||o.pathname==="/privacy",{user:b}=x?{user:null}:R(),r=b?.role==="seller",[l,c]=m.useState(!1),[d,s]=m.useState(""),{data:v,isLoading:w,error:j}=X(r&&!x?f.SELLER_TERMS_CONDITIONS:f.TERMS_CONDITIONS),i=L(),t=v?.data;if(m.useEffect(()=>{t?s(t.content):!t&&r&&s(n)},[t,r]),w)return e.jsx(h,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(p,{className:"px-4 sm:px-6 py-6",children:[e.jsx(a,{className:"h-8 w-48 mb-4"}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-3/4"}),e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-5/6"})]})]})});if(j&&r)return e.jsx(h,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(p,{className:"px-4 sm:px-6 py-6",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-semibold mb-4",children:"Terms & Conditions"}),e.jsx("p",{className:"text-red-500",children:"Failed to load content. Please try again later."})]})});const C=t?.content||n,N=t?.title||"Terms & Conditions",g=t?.updatedAt,P=()=>{c(!0),t||s(n)},T=()=>{c(!1),s(t?t.content:n)},E=async()=>{try{await i.mutateAsync({type:f.SELLER_TERMS_CONDITIONS,title:"Terms & Conditions",content:d,isActive:!0}),c(!1)}catch(u){console.error("Failed to save content:",u)}};return e.jsx(h,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(p,{className:"px-4 sm:px-6 py-6",children:[e.jsxs("div",{className:"flex justify-between items-start mb-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg sm:text-xl font-semibold",children:N}),g&&!l&&e.jsxs("span",{className:"text-xs text-gray-500 my-2",children:["Last Updated ",O(g)]})]}),o.pathname!=="/terms"&&e.jsx("div",{className:"flex items-center gap-2",children:r&&!l&&e.jsxs(y,{onClick:P,className:"flex items-center gap-1 h-12   text-white hover:text-white",children:[e.jsx(A,{className:"w-4 h-4"}),"Edit"]})})]}),l?e.jsxs("div",{className:"space-y-4",children:[e.jsx("textarea",{value:d,onChange:u=>s(u.target.value),className:"w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-vertical text-sm",placeholder:"Enter your terms and conditions..."}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(y,{variant:"outline",onClick:T,disabled:i.isPending,className:"flex items-center gap-1 w-[128px] border-gray-500 text-gray-500",children:"Cancel"}),e.jsx(y,{onClick:E,disabled:i.isPending||!d.trim(),className:"flex items-center gap-1 text-white hover:text-white w-[128px]",children:i.isPending?"updating...":"Update"})]})]}):e.jsx("div",{className:"text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line",children:C})]})})};export{B as default};
