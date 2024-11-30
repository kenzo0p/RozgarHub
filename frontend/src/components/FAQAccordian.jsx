import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FAQAccordion = () => {
  return (
    <section className="p-6 bg-slate-50 rounded-lg">
      <h2 className="text-2xl font-bold text-center text-[#526a6e] mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {/* Question 1 */}
        <AccordionItem value="faq-1">
          <AccordionTrigger>How do I register on RozgarHub?</AccordionTrigger>
          <AccordionContent>
            To register, click the "Sign Up" button on the top right of the homepage. Fill in your details and follow the instructions to create an account.
          </AccordionContent>
        </AccordionItem>

        {/* Question 2 */}
        <AccordionItem value="faq-2">
          <AccordionTrigger>How can I find jobs that suit me?</AccordionTrigger>
          <AccordionContent>
            Use the job search bar to filter jobs by title, location, or skills. You can also browse categories for blue-collar jobs that match your expertise.
          </AccordionContent>
        </AccordionItem>

        {/* Question 3 */}
        <AccordionItem value="faq-3">
          <AccordionTrigger>How do I contact an employer?</AccordionTrigger>
          <AccordionContent>
            After applying to a job, you can use the contact information provided by the employer or communicate through RozgarHub’s messaging feature.
          </AccordionContent>
        </AccordionItem>

        {/* Question 4 */}
        <AccordionItem value="faq-4">
          <AccordionTrigger>Is RozgarHub free to use?</AccordionTrigger>
          <AccordionContent>
            Yes, RozgarHub is free for job seekers. Employers may have premium plans for enhanced visibility of their job postings.But for now it's free to all 
          </AccordionContent>
        </AccordionItem>

        {/* Question 5 */}
        <AccordionItem value="faq-5">
          <AccordionTrigger>What should I do if I face technical issues?</AccordionTrigger>
          <AccordionContent>
            Please contact our support team via the "Help" section in your dashboard or email us at support@rozgarhub.com.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default FAQAccordion;
