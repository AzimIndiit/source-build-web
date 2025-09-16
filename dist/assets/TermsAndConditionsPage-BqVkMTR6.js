import{u as E,a as S,r as u,j as e,C as m,b as h,S as a,B as p}from"./index-BiCr9dd_.js";import{u as X,C as f,a as A}from"./useCmsMutations-C-I_mNxV.js";import{f as U}from"./date-utils-CIparGJB.js";import{P as O}from"./pen-dOS5U9bV.js";const o=`
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
📞 Phone: +91-XXXXXXXXXX`,k=()=>{const{user:x}=E(),g=S(),r=x?.role==="seller",[n,l]=u.useState(!1),[c,s]=u.useState(""),{data:b,isLoading:v,error:w}=X(r?f.TERMS_CONDITIONS:void 0),i=A(),t=b?.data;if(u.useEffect(()=>{t?s(t.content):!t&&r&&s(o)},[t,r]),v)return e.jsx(m,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(h,{className:"px-4 sm:px-6 py-6",children:[e.jsx(a,{className:"h-8 w-48 mb-4"}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-3/4"}),e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-5/6"})]})]})});if(w&&r)return e.jsx(m,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(h,{className:"px-4 sm:px-6 py-6",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-semibold mb-4",children:"Terms & Conditions"}),e.jsx("p",{className:"text-red-500",children:"Failed to load content. Please try again later."})]})});const j=t?.content||o,C=t?.title||"Terms & Conditions",y=t?.updatedAt,N=()=>{l(!0),t||s(o)},P=()=>{l(!1),s(t?t.content:o)},T=async()=>{try{await i.mutateAsync({type:f.TERMS_CONDITIONS,title:"Terms & Conditions",content:c,isActive:!0}),l(!1)}catch(d){console.error("Failed to save content:",d)}};return e.jsx(m,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(h,{className:"px-4 sm:px-6 py-6",children:[e.jsxs("div",{className:"flex justify-between items-start mb-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg sm:text-xl font-semibold",children:C}),y&&!n&&e.jsxs("span",{className:"text-xs text-gray-500 my-2",children:["Last Updated ",U(y)]})]}),g.pathname!=="/terms"&&e.jsx("div",{className:"flex items-center gap-2",children:r&&!n&&e.jsxs(p,{onClick:N,className:"flex items-center gap-1 h-12   text-white hover:text-white",children:[e.jsx(O,{className:"w-4 h-4"}),"Edit"]})})]}),n?e.jsxs("div",{className:"space-y-4",children:[e.jsx("textarea",{value:c,onChange:d=>s(d.target.value),className:"w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-vertical text-sm",placeholder:"Enter your terms and conditions..."}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(p,{variant:"outline",onClick:P,disabled:i.isPending,className:"flex items-center gap-1 w-[128px] border-gray-500 text-gray-500",children:"Cancel"}),e.jsx(p,{onClick:T,disabled:i.isPending||!c.trim(),className:"flex items-center gap-1 text-white hover:text-white w-[128px]",children:i.isPending?"updating...":"Update"})]})]}):e.jsx("div",{className:"text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line",children:j})]})})};export{k as default};
