export const mockScenarios = [
  {
    id: "landlord-tenant",
    title: "Landlord-Tenant Deposit Recovery",
    courtType: "Civil Court",
    jurisdiction: "District Court, Delhi (Civil Jurisdiction)",
    judge: "Judge Madan B. Lokur",
    opponent: "Mr. Rajesh Sharma (Landlord)",
    opponentCounsel: "Advocate Amit Vyas",
    dispute: "Tenant claims refund of Rs. 50,000 security deposit. Landlord refuses, claiming Rs. 60,000 in damages to walls, woodwork, and plumbing.",
    documents: [
      { name: "Lease_Agreement_2025.pdf", size: "1.2 MB", desc: "Lease deed registered on 15th Jan 2025 showing Rs. 50,000 deposit." },
      { name: "Move_Out_Photos.zip", size: "4.8 MB", desc: "Photographs taken on day of vacating, showing pristine walls and fixtures." },
      { name: "Notice_of_Termination.pdf", size: "240 KB", desc: "1-month prior written notice sent via email as per Clause 9." }
    ],
    acts: [
      { section: "Section 108(m)", act: "Transfer of Property Act, 1882", desc: "Obligation of tenant to restore property in as good a condition as received, subject to reasonable wear and tear." },
      { section: "Section 74", act: "Indian Contract Act, 1872", desc: "Compensation for breach of contract. Damages must be proved, not arbitrarily withheld." }
    ],
    benchmarks: {
      strong: "Counsel must cite the registered lease deed, prove 1-month notice compliance, present Move-Out photos as primary evidence of property condition, and argue that withholding deposit without bills/proof of damage is illegal under Section 74 of the Contract Act. Must maintain formal etiquette ('My Lord', 'Your Honour') and handle judge questions directly.",
      weak: "Counsel makes personal accusations against the landlord, has no photographic evidence, cannot verify notice compliance, fails to cite relevant sections of the Transfer of Property Act, and uses informal language ('Sir', 'Listen to me')."
    },
    // The dialog structure for simulated execution
    dialogTree: {
      APPEARANCE: {
        speaker: "clerk",
        text: "Calling Case No. 402/2026: Rohan Sen vs Rajesh Sharma. Matter regarding recovery of lease security deposit. Counsel for the Petitioner, state your appearance.",
        options: [
          {
            text: "May it please the court, my name is Advocate Rohan Sen, appearing on behalf of the Petitioner. I am ready to present.",
            type: "strong",
            scoreImpact: { legalAccuracy: 9, proceduralCompliance: 10, etiquette: 10 },
            judgePatienceImpact: 5,
            nextStep: "PETITIONER_STATEMENT"
          },
          {
            text: "Yes, I am the petitioner's lawyer. Let's start the case.",
            type: "weak",
            scoreImpact: { legalAccuracy: 5, proceduralCompliance: 5, etiquette: 4 },
            judgePatienceImpact: -10,
            nextStep: "PETITIONER_STATEMENT"
          }
        ]
      },
      PETITIONER_STATEMENT: {
        speaker: "judge",
        text: "Very well. Mr. Sen, I have reviewed the brief pleadings. Explain why your client is entitled to the refund of Rs. 50,000 when the landlord claims extensive damage was caused to the premises.",
        options: [
          {
            text: "My Lord, the lease ended on April 30th. My client served a valid notice under Clause 9 of the lease. We have attached move-out photographs showing the flat was in excellent condition. Under Section 108 of the Transfer of Property Act, the tenant is only liable for damage beyond reasonable wear and tear. The landlord has withheld the deposit without providing any invoices or proof of repairs, which is arbitrary under Section 74 of the Contract Act.",
            type: "strong",
            scoreImpact: { legalAccuracy: 10, evidenceStrength: 10, argumentationClarity: 10 },
            judgePatienceImpact: 10,
            nextStep: "JUDICIAL_QUESTION"
          },
          {
            text: "Your Honour, the landlord is just lying. My client did not damage anything. The landlord is greedy and wants to keep the money. We want our money back with interest immediately because it's a huge sum for my client.",
            type: "weak",
            scoreImpact: { legalAccuracy: 3, evidenceStrength: 3, argumentationClarity: 4 },
            judgePatienceImpact: -15,
            nextStep: "JUDICIAL_QUESTION"
          }
        ]
      },
      JUDICIAL_QUESTION: {
        speaker: "judge",
        text: "The landlord's reply asserts that the walls had heavy dampness and drilling damage, requiring professional repair costing Rs. 60,000. How do you respond to the landlord's photos of damaged kitchen tiles?",
        options: [
          {
            text: "My Lord, the kitchen tiles in those photos were damaged due to a structural plumbing leak inside the walls, which was the landlord's duty to maintain under Clause 6. Furthermore, our move-out photos taken on April 30th show the tiles were intact at the time of handing over key possession, as signed by the security guard in the handover register.",
            type: "strong",
            scoreImpact: { legalAccuracy: 9, evidenceStrength: 10, pressureHandling: 10 },
            judgePatienceImpact: 10,
            nextStep: "OPPOSING_COUNSEL"
          },
          {
            text: "We don't know when those photos were taken. The landlord probably broke the tiles himself after my client left just to manufacture evidence. This is fraud!",
            type: "weak",
            scoreImpact: { legalAccuracy: 4, evidenceStrength: 2, pressureHandling: 4 },
            judgePatienceImpact: -10,
            nextStep: "OPPOSING_COUNSEL"
          }
        ]
      },
      OPPOSING_COUNSEL: {
        speaker: "opposing",
        text: "My Lord, if I may. The petitioner tenant was highly irresponsible. My brother-in-law visited the property in March and saw three unauthorized guests staying there. The tenant drilled 25 holes in the living room and ruined the woodwork. Here is a WhatsApp message from a neighbour complaining about noise and drilling.",
        objectionOpportunity: {
          statementToObject: "My brother-in-law visited the property in March and saw three unauthorized guests staying there.",
          correctObjectionType: "Hearsay",
          explanation: "The statement is based on what the brother-in-law allegedly saw, not first-hand witness testimony under oath.",
          successResponse: "Objection sustained. The brother-in-law is not in court to testify, and this statement is hearsay. Counsel, stick to verified evidence.",
          failResponse: "Counsel, you did not object to this hearsay statement. The court will note the respondent's arguments, though they carry low evidentiary weight."
        },
        nextStep: "CROSS_EXAMINATION"
      },
      CROSS_EXAMINATION: {
        speaker: "judge",
        text: "Mr. Sen, the respondent has presented the lease agreement which states in Clause 12 that the tenant must paint the flat upon vacating. Your client did not paint the flat. Why shouldn't the cost of painting be deducted from the security deposit?",
        options: [
          {
            text: "Your Honour, while Clause 12 requires painting, it must be read with Clause 4, which states 'subject to natural wear and tear'. Painting is a standard wear-and-tear requirement after a 3-year tenancy. Moreover, the landlord is claiming Rs. 60,000, which far exceeds standard painting costs of Rs. 15,000 for a 1BHK. We are willing to concede a reasonable deduction of Rs. 12,000 for painting, but the remaining Rs. 38,000 must be returned.",
            type: "strong",
            scoreImpact: { legalAccuracy: 9, proceduralCompliance: 9, pressureHandling: 9 },
            judgePatienceImpact: 5,
            nextStep: "VERDICT"
          },
          {
            text: "Clause 12 is unfair and void. Landlords always try to scam tenants with painting charges. We refuse to pay a single rupee for painting because the landlord was extremely rude throughout the lease.",
            type: "weak",
            scoreImpact: { legalAccuracy: 3, proceduralCompliance: 4, pressureHandling: 3 },
            judgePatienceImpact: -15,
            nextStep: "VERDICT"
          }
        ]
      },
      VERDICT: {
        speaker: "judge",
        text: "I have heard both sides. The tenant has presented strong primary evidence (move-out photographs and a signed handover register) which disproves the landlord's claim of tile damages. However, the tenant is in breach of Clause 12 regarding painting. Accordingly, the court directs the respondent landlord to refund Rs. 38,000 within 14 days, deducting Rs. 12,000 for standard painting. Case disposed. Gavel down.",
        nextStep: "FEEDBACK"
      }
    }
  },
  {
    id: "product-liability",
    title: "Smartphone Battery Explosion Liability",
    courtType: "Consumer Forum",
    jurisdiction: "District Consumer Disputes Redressal Commission, Mumbai",
    judge: "President Justice Sunita Gupta",
    opponent: "Nexa Electronics Pvt. Ltd. (Manufacturer)",
    opponentCounsel: "Advocate Vikramaditya Birla",
    dispute: "Consumer claims Rs. 80,000 refund and Rs. 2,00,000 compensation for a Nexa Pro 12 smartphone battery that exploded while charging, causing minor burns and property damage. Manufacturer claims the explosion was caused by using a cheap, third-party charger.",
    documents: [
      { name: "Purchase_Invoice_Nexa.pdf", size: "850 KB", desc: "Invoice showing purchase date 12th Dec 2025, costing Rs. 80,000." },
      { name: "Medical_Report_Burns.pdf", size: "1.4 MB", desc: "Hospital emergency ward discharge card showing treatment for 1st-degree hand burns." },
      { name: "Fire_Dept_Incident_Report.pdf", size: "2.1 MB", desc: "Report stating the fire originated from a thermal runaway in the smartphone battery." }
    ],
    acts: [
      { section: "Section 84", act: "Consumer Protection Act, 2019", desc: "Liability of product manufacturer in a product liability action if the product contains a manufacturing defect or design defect." },
      { section: "Section 2(10)", act: "Consumer Protection Act, 2019", desc: "Defect means any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard of a product." }
    ],
    benchmarks: {
      strong: "Counsel must argue product liability under Section 84 of CPA 2019, prove the purchase was within warranty, submit the Fire Department report as objective evidence of battery malfunction, and present the medical discharge card for burn injuries. Must counter the charger claim by showing the original charger was used or that the device lacked thermal cutoff protection (manufacturing defect).",
      weak: "Counsel complains about poor customer service, fails to reference the CPA 2019 sections, does not highlight the Fire Department report, and threatens the electronics company with social media campaigns."
    },
    dialogTree: {
      APPEARANCE: {
        speaker: "clerk",
        text: "Calling Complaint No. 1045/2026: Vikram Mehra vs Nexa Electronics. Product liability claim for mobile battery explosion. Petitioner Counsel, state your appearance.",
        options: [
          {
            text: "May it please the Commission, I am Advocate Vikram Mehra representing the complainant. I am ready to argue this matter.",
            type: "strong",
            scoreImpact: { legalAccuracy: 9, proceduralCompliance: 10, etiquette: 10 },
            judgePatienceImpact: 5,
            nextStep: "PETITIONER_STATEMENT"
          },
          {
            text: "Hi, I represent Vikram Mehra, the guy whose phone exploded. We want justice.",
            type: "weak",
            scoreImpact: { legalAccuracy: 4, proceduralCompliance: 5, etiquette: 5 },
            judgePatienceImpact: -10,
            nextStep: "PETITIONER_STATEMENT"
          }
        ]
      },
      PETITIONER_STATEMENT: {
        speaker: "judge",
        text: "Mr. Counsel, this is a serious allegation of product liability. What evidence do you have to prove that this explosion was due to a manufacturing defect in the phone itself, and not user negligence?",
        options: [
          {
            text: "Madam President, we have submitted three critical exhibits. Exhibit A is the invoice showing the phone was purchased just 4 months prior and was under full warranty. Exhibit B is the official Fire Department Incident Report, which explicitly states the fire originated inside the phone due to 'thermal runaway' of the lithium-ion battery. Under Section 84 of the Consumer Protection Act, 2019, the manufacturer is strictly liable for manufacturing defects. The phone did not trigger a thermal shutoff, demonstrating a clear design and safety defect under Section 2(10).",
            type: "strong",
            scoreImpact: { legalAccuracy: 10, evidenceStrength: 10, argumentationClarity: 10 },
            judgePatienceImpact: 10,
            nextStep: "JUDICIAL_QUESTION"
          },
          {
            text: "Your Honour, Nexa Pro 12 is a horrible phone. There are reviews online saying this model gets very hot. My client was just charging it normally and it blew up in his hand. Look at his hand, it was burned! The manufacturer should be put in jail for selling bombs as phones.",
            type: "weak",
            scoreImpact: { legalAccuracy: 3, evidenceStrength: 4, argumentationClarity: 4 },
            judgePatienceImpact: -15,
            nextStep: "JUDICIAL_QUESTION"
          }
        ]
      },
      JUDICIAL_QUESTION: {
        speaker: "judge",
        text: "The manufacturer's forensic engineer reports that the phone charging port showed traces of copper residue, which indicates that a high-wattage, non-compatible charger was used, causing an electrical short. Was your client using the original charger supplied in the box?",
        options: [
          {
            text: "Yes, Madam President. My client was using the original 65W charger supplied in the retail box. We have submitted photographs of the melted original charger plug, which was plugged into a surge-protected socket. Furthermore, modern smartphones possess internal power-delivery controllers. If the device was indeed exposed to high wattage, it should have shut down. The failure of the overvoltage protection chip is, in itself, a manufacturing defect under Section 84.",
            type: "strong",
            scoreImpact: { legalAccuracy: 10, evidenceStrength: 9, pressureHandling: 10 },
            judgePatienceImpact: 10,
            nextStep: "OPPOSING_COUNSEL"
          },
          {
            text: "My client doesn't even own another charger. How could he use a different one? The manufacturer is just trying to blame the customer. Copper is in every electronics port, so their forensic report is probably made up.",
            type: "weak",
            scoreImpact: { legalAccuracy: 4, evidenceStrength: 3, pressureHandling: 4 },
            judgePatienceImpact: -10,
            nextStep: "OPPOSING_COUNSEL"
          }
        ]
      },
      OPPOSING_COUNSEL: {
        speaker: "opposing",
        text: "Madam President, the complainant has a history of reckless claims. He left a 1-star review on our website a month ago complaining about battery life, and stated he was using a fast-charging dock he bought from a street vendor. Our customer service executive, who is a highly reliable source, heard from the complainant's wife that he dropped the phone in water two days prior to the accident.",
        objectionOpportunity: {
          statementToObject: "Our customer service executive, who is a highly reliable source, heard from the complainant's wife that he dropped the phone in water two days prior to the accident.",
          correctObjectionType: "Hearsay",
          explanation: "The statement is what the executive heard from the wife, which is double hearsay and lacks direct witness validation.",
          successResponse: "Objection sustained. The customer service executive's account of what the wife said is hearsay. The opponent counsel must present direct testimony or a water-damage sensor report.",
          failResponse: "Counsel, you did not object to this hearsay statement. The commission will record the claim of water damage for consideration."
        },
        nextStep: "CROSS_EXAMINATION"
      },
      CROSS_EXAMINATION: {
        speaker: "judge",
        text: "Mr. Counsel, even if we accept there was a battery malfunction, you are claiming Rs. 2,00,000 in mental agony and compensation. Your client's medical bill for the burn treatment was only Rs. 2,500. How do you justify this massive compensation claim?",
        options: [
          {
            text: "Madam President, the compensation is not merely for the physical medical bill. The explosion occurred at 2:00 AM on my client's wooden desk, igniting documents and curtains. It could have been fatal had my client not woken up. The incident caused severe psychological trauma, making him fearful of using mobile devices, and damaged his workspace. Given the strict liability under Section 84, punitive damages are warranted to ensure manufacturers implement high safety standards.",
            type: "strong",
            scoreImpact: { legalAccuracy: 9, proceduralCompliance: 9, pressureHandling: 9 },
            judgePatienceImpact: 5,
            nextStep: "VERDICT"
          },
          {
            text: "A phone exploding is a traumatic experience! Nexa is a multi-million company, so Rs. 2,00,000 is peanuts to them. They need to pay this amount as a lesson to stop selling defective products.",
            type: "weak",
            scoreImpact: { legalAccuracy: 3, proceduralCompliance: 4, pressureHandling: 3 },
            judgePatienceImpact: -15,
            nextStep: "VERDICT"
          }
        ]
      },
      VERDICT: {
        speaker: "judge",
        text: "The Commission finds that the Fire Department report establishes battery failure as the cause of fire. The manufacturer failed to disprove the existence of a manufacturing defect in the overvoltage protection chip. Under Section 84 of the Consumer Protection Act, 2019, Nexa Electronics is directed to refund Rs. 80,000 for the phone, and pay Rs. 50,000 as compensation for physical injury and property damage, along with Rs. 10,000 as litigation costs. Complaint allowed. Gavel down.",
        nextStep: "FEEDBACK"
      }
    }
  },
  {
    id: "wrongful-termination",
    title: "Wrongful Termination & Unpaid Severance",
    courtType: "Labour Tribunal",
    jurisdiction: "Labour Court - I, Bengaluru",
    judge: "Presiding Officer H. S. Kempanna",
    opponent: "Apex Technologies Inc. (Employer)",
    opponentCounsel: "Advocate S. N. Murthy",
    dispute: "Senior UI/UX Designer terminated without 3-month contract notice or severance pay. Employer claims termination was 'for cause' due to sharing proprietary wireframes on a public Figma community page (IP breach).",
    documents: [
      { name: "Employment_Contract_Apex.pdf", size: "2.1 MB", desc: "Contract showing 3-month notice period or 3 months' pay in lieu of notice." },
      { name: "Termination_Letter.pdf", size: "310 KB", desc: "Letter terminating employment with immediate effect due to alleged IP leakage, without inquiry." },
      { name: "Figma_Log_Details.pdf", size: "1.7 MB", desc: "Log showing the published Figma file was a generic open-source design kit, not proprietary Apex wireframes." }
    ],
    acts: [
      { section: "Section 25-F", act: "Industrial Disputes Act, 1947", desc: "Conditions precedent to retrenchment of workmen. Requires 1 month's notice in writing indicating reasons, or wages in lieu of notice, and retrenchment compensation." },
      { section: "Natural Justice Principles", act: "Common Law", desc: "Right to be heard. No employee can be dismissed for misconduct without a domestic inquiry giving them an opportunity to defend." }
    ],
    benchmarks: {
      strong: "Counsel must argue violation of Natural Justice principles (no domestic inquiry was conducted prior to summary dismissal), present the Figma log showing the published file was generic/non-proprietary, cite Clause 14 of the Employment Contract for severance, and reference Section 25-F of the Industrial Disputes Act if applicable (status of workman).",
      weak: "Counsel argues that the boss was jealous of the designer's skills, admits the employee shared files but claims 'everyone does it', fails to raise the lack of a domestic inquiry, and demands job reinstatement without legal basis."
    },
    dialogTree: {
      APPEARANCE: {
        speaker: "clerk",
        text: "Calling Dispute Reference No. 85/2026: Anjali Rao vs Apex Technologies. Dispute regarding wrongful termination. Counsel for the Petitioner, state your appearance.",
        options: [
          {
            text: "May it please the Tribunal, Advocate Anjali Rao appearing for the Petitioner. I am ready to argue this reference.",
            type: "strong",
            scoreImpact: { legalAccuracy: 9, proceduralCompliance: 10, etiquette: 10 },
            judgePatienceImpact: 5,
            nextStep: "PETITIONER_STATEMENT"
          },
          {
            text: "Advocate Rao here for Anjali. We are here to fight this wrongful firing.",
            type: "weak",
            scoreImpact: { legalAccuracy: 4, proceduralCompliance: 5, etiquette: 5 },
            judgePatienceImpact: -10,
            nextStep: "PETITIONER_STATEMENT"
          }
        ]
      },
      PETITIONER_STATEMENT: {
        speaker: "judge",
        text: "Counsel, Apex Technologies states that your client committed a material breach of the confidentiality clause of her contract by publishing proprietary wireframes of their upcoming mobile app on Figma. Why should they pay notice wages for gross misconduct?",
        options: [
          {
            text: "Sir, the termination was conducted in gross violation of the principles of Natural Justice. My client was terminated with immediate effect via email without a charge sheet, show-cause notice, or a domestic inquiry to defend herself. Furthermore, Exhibit C proves that the Figma file published by my client was a generic, open-source wireframe kit that she had created independently prior to joining Apex. The wireframes contained no proprietary Apex brand assets or IP. Dismissing her under the guise of 'misconduct' without any internal investigation is wrongful and arbitrary.",
            type: "strong",
            scoreImpact: { legalAccuracy: 10, evidenceStrength: 10, argumentationClarity: 10 },
            judgePatienceImpact: 10,
            nextStep: "JUDICIAL_QUESTION"
          },
          {
            text: "Your Honour, my client is a brilliant designer. She only shared a minor figma link to get feedback from other designers. It was not a big deal. The company used this minor issue as an excuse to lay her off because they were facing financial troubles. They fired her immediately just to save money.",
            type: "weak",
            scoreImpact: { legalAccuracy: 4, evidenceStrength: 4, argumentationClarity: 4 },
            judgePatienceImpact: -15,
            nextStep: "JUDICIAL_QUESTION"
          }
        ]
      },
      JUDICIAL_QUESTION: {
        speaker: "judge",
        text: "The respondent has presented a forensic screenshot of a Figma project titled 'Project Alpha - Checkout Screen' which matches Apex's upcoming app checkout flow. The project creator's ID matches your client's email. Is that screenshot fabricated, or did your client copy company layouts?",
        options: [
          {
            text: "Sir, the screenshot is misleading. The 'Project Alpha' flow is a standard e-commerce checkout layout containing standard input boxes. However, if you examine the creation timestamp in Exhibit C, the wireframes were published on the public Figma community on October 12, 2025, which is three weeks *before* my client signed her employment contract with Apex. Apex copied her open-source layouts, not the other way around. Without a proper inquiry, the company jumped to conclusions.",
            type: "strong",
            scoreImpact: { legalAccuracy: 10, evidenceStrength: 10, pressureHandling: 10 },
            judgePatienceImpact: 10,
            nextStep: "OPPOSING_COUNSEL"
          },
          {
            text: "My client doesn't remember creating that file. Figma accounts can be hacked, and anyone could have uploaded that screen with her email address. Apex is using tech jargon to confuse this court.",
            type: "weak",
            scoreImpact: { legalAccuracy: 3, evidenceStrength: 3, pressureHandling: 4 },
            judgePatienceImpact: -10,
            nextStep: "OPPOSING_COUNSEL"
          }
        ]
      },
      OPPOSING_COUNSEL: {
        speaker: "opposing",
        text: "Your Honour, the employee's behavior was consistently defiant. Her manager reported that she was repeatedly late to meetings and frequently browsed social media during work hours. Additionally, she was heard by the HR assistant telling a coworker that she plans to resign and join a competitor next month.",
        objectionOpportunity: {
          statementToObject: "she was heard by the HR assistant telling a coworker that she plans to resign and join a competitor next month.",
          correctObjectionType: "Hearsay",
          explanation: "The statement is what the HR assistant allegedly heard the coworker say, which is double hearsay and completely unverified.",
          successResponse: "Objection sustained. Advocate Murthy, what the HR assistant allegedly overheard is hearsay and not relevant to the specific termination charge of IP breach. Refrain from introducing hearsay.",
          failResponse: "Counsel, you did not object to this hearsay statement. The tribunal will note the company's allegations of misconduct, despite the lack of direct testimony."
        },
        nextStep: "CROSS_EXAMINATION"
      },
      CROSS_EXAMINATION: {
        speaker: "judge",
        text: "Mr. Counsel, Apex Technologies is a private corporation, and the contract states that employment is 'at-will'. How can you invoke Section 25-F of the Industrial Disputes Act when your client is a professional designer, who might not fit the legal definition of a 'workman' under the Act?",
        options: [
          {
            text: "Sir, even if my client is classified as a supervisor or non-workman, it is settled law by the Supreme Court that even in private contracts, a dismissal based on allegations of 'misconduct' is stigmatic in nature. A stigmatic termination without a domestic inquiry is illegal in its entirety. Therefore, she is entitled to full notice pay of 3 months and severance compensation as per Clause 14 of the contract, as well as damages for wrongful dismissal, since she has been unable to find employment due to this false allegation of IP theft.",
            type: "strong",
            scoreImpact: { legalAccuracy: 10, proceduralCompliance: 9, pressureHandling: 9 },
            judgePatienceImpact: 5,
            nextStep: "VERDICT"
          },
          {
            text: "At-will employment is unconstitutional and illegal in India. Everyone is a workman under the law if they work for a salary. Apex Technologies cannot hide behind contracts to exploit employees. We want reinstatement and full back wages.",
            type: "weak",
            scoreImpact: { legalAccuracy: 3, proceduralCompliance: 4, pressureHandling: 3 },
            judgePatienceImpact: -15,
            nextStep: "VERDICT"
          }
        ]
      },
      VERDICT: {
        speaker: "judge",
        text: "The Tribunal finds that the employer terminated the services of the petitioner on grounds of alleged misconduct without conducting a domestic inquiry or providing a show-cause notice. This is a severe violation of the principles of Natural Justice. The Figma logs establish that the wireframes were published prior to employment. The termination is held to be wrongful. Apex Technologies is ordered to pay 3 months' salary in lieu of notice, along with severance compensation and Rs. 50,000 in legal damages. Reference disposed. Gavel down.",
        nextStep: "FEEDBACK"
      }
    }
  }
];
