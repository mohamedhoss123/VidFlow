import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from "@/components/ui/button"
export const Route = createFileRoute('/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TermsPage/>
}


function TermsPage() {
  const lastUpdated = "April 1, 2025"

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to FileUploader. These Terms of Service ("Terms") govern your access to and use of our website, 
            products, and services ("Services"). Please read these Terms carefully, and contact us if you have any questions.
          </p>
          <p>
            By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree 
            to these Terms, please do not use our Services.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">2. Using Our Services</h2>
          <h3 className="text-xl font-medium mt-6 mb-3">2.1 Account Registration</h3>
          <p>
            To access certain features of our Services, you may be required to register for an account. You agree to provide 
            accurate, current, and complete information during the registration process and to update such information to keep 
            it accurate, current, and complete.
          </p>
          <p>
            You are responsible for safeguarding your account credentials and for all activities that occur under your account. 
            You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">2.2 User Content</h3>
          <p>
            Our Services allow you to upload, store, and share content such as videos, images, and other materials ("User Content"). 
            You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, 
            reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with providing our Services.
          </p>
          <p>
            You represent and warrant that you own or have the necessary rights to your User Content and that your User Content 
            does not violate the rights of any third party, including intellectual property rights and privacy rights.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">3. Prohibited Conduct</h2>
          <p>
            You agree not to use our Services to:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Violate any applicable law or regulation</li>
            <li>Infringe the intellectual property rights of others</li>
            <li>Upload or share content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
            <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
            <li>Attempt to gain unauthorized access to any part of the Services</li>
            <li>Use the Services for any commercial purpose without our prior written consent</li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">4. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to our Services at any time, with or without cause, and with 
            or without notice. Upon termination, your right to use the Services will immediately cease.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">5. Disclaimers</h2>
          <p>
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
            INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
            NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Services will be uninterrupted or error-free, that defects will be corrected, or that the 
            Services or the servers that make them available are free of viruses or other harmful components.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
            WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO 
            OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. If we make material changes to these Terms, we will notify 
            you by email or by posting a notice on our website. Your continued use of the Services after such notification 
            constitutes your acceptance of the modified Terms.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to 
            its conflict of law provisions.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            Email: legal@fileuploader.com<br />
            Address: 123 Upload Street, File City, FC 12345
          </p>
        </div>
      </div>
    </div>
  )
}
