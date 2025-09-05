import{m as E,r as o,j as e,h as p,i as h,S as a,B as y}from"./index-BCiIUrXb.js";import{u as A,a as W,P as Y,C as x}from"./useCmsMutations-ByGupvtl.js";import{f as X}from"./date-utils-CIparGJB.js";const c=`
Last Updated: 27 Aug 2025

Your privacy is important to us at Source Build. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.

1. Information We Collect

Personal Information:
• Name, email address, phone number
• Billing and shipping addresses
• Payment information
• Account credentials

Usage Information:
• Browser type and version
• Device information
• IP address
• Pages visited and time spent
• Purchase history

2. How We Use Your Information

We use your information to:
• Process orders and payments
• Provide customer support
• Send order updates and notifications
• Improve our services
• Comply with legal obligations
• Prevent fraud and enhance security

3. Information Sharing

We may share your information with:
• Service providers (payment processors, shipping partners)
• Law enforcement when required by law
• Business partners with your consent
• In connection with business transfers or acquisitions

We do NOT sell your personal information to third parties.

4. Data Security

We implement appropriate technical and organizational measures to protect your information, including:
• SSL encryption for data transmission
• Secure servers and databases
• Regular security audits
• Limited access to personal information

5. Your Rights

You have the right to:
• Access your personal information
• Correct inaccurate data
• Request deletion of your data
• Opt-out of marketing communications
• Data portability

6. Cookies

We use cookies and similar technologies to:
• Maintain your session
• Remember preferences
• Analyze site usage
• Provide targeted advertising

You can manage cookie preferences through your browser settings.

7. Children's Privacy

Our platform is not intended for children under 18. We do not knowingly collect information from minors.

8. International Data Transfers

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.

9. Data Retention

We retain your information for as long as necessary to:
• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce agreements

10. Changes to This Policy

We may update this Privacy Policy periodically. Continued use of our platform constitutes acceptance of changes.

11. Contact Us

For privacy-related questions:
📧 Email: privacy@sourcebuild.com
📞 Phone: +91-XXXXXXXXXX
🏢 Address: Your Business Address Here

Last updated: [Date]
Effective date: [Date]`,U=()=>{const{user:g}=E(),r=g?.role==="seller",[l,d]=o.useState(!1),[m,t]=o.useState(""),[v,i]=o.useState("Privacy Policy"),{data:P,isLoading:w,error:j}=A(r?x.PRIVACY_POLICY:void 0),n=W(),s=P?.data;if(o.useEffect(()=>{s?(t(s.content),i(s.title)):!s&&r&&(t(c),i("Privacy Policy"))},[s,r]),w)return e.jsx(p,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(h,{className:"px-4 sm:px-6 py-6",children:[e.jsx(a,{className:"h-8 w-48 mb-4"}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-3/4"}),e.jsx(a,{className:"h-4 w-full"}),e.jsx(a,{className:"h-4 w-5/6"})]})]})});if(j&&r)return e.jsx(p,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(h,{className:"px-4 sm:px-6 py-6",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-semibold mb-4",children:"Privacy Policy"}),e.jsx("p",{className:"text-red-500",children:"Failed to load content. Please try again later."})]})});const C=s?.content||c,b=s?.title||"Privacy Policy",f=s?.lastUpdated,N=()=>{d(!0),s||t(c)},S=()=>{d(!1),s?(t(s.content),i(s.title)):(t(c),i("Privacy Policy"))},I=async()=>{try{await n.mutateAsync({type:x.PRIVACY_POLICY,title:v,content:m,isActive:!0}),d(!1)}catch(u){console.error("Failed to save content:",u)}};return e.jsx(p,{className:"bg-white border-gray-200 shadow-none",children:e.jsxs(h,{className:"px-4 sm:px-6 py-6",children:[e.jsxs("div",{className:"flex justify-between items-start mb-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg sm:text-xl font-semibold",children:b}),f&&!l&&e.jsxs("span",{className:"text-xs text-gray-500 my-2",children:["Last Updated ",X(f)]})]}),e.jsx("div",{className:"flex items-center gap-2",children:r&&!l&&e.jsxs(y,{onClick:N,className:"flex items-center gap-1 h-12   text-white hover:text-white",children:[e.jsx(Y,{className:"w-4 h-4"}),"Edit"]})})]}),l?e.jsxs("div",{className:"space-y-4",children:[e.jsx("textarea",{value:m,onChange:u=>t(u.target.value),className:"w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-vertical text-sm",placeholder:"Enter your privacy policy..."}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(y,{variant:"outline",onClick:S,disabled:n.isPending,className:"flex items-center gap-1 w-[128px] border-gray-500 text-gray-500",children:"Cancel"}),e.jsx(y,{onClick:I,disabled:n.isPending||!m.trim(),className:"flex items-center gap-1 text-white hover:text-white w-[128px]",children:n.isPending?"Saving...":"Save"})]})]}):e.jsx("div",{className:"text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line",children:C})]})})};export{U as default};
