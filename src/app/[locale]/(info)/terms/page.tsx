import { Metadata } from "next";

import { ColoredText } from "@/components/ColoredText";
import { EXTERNAL_LINKS, Link } from "@/routing";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://inkonchain.com/terms",
  },
  title: "Terms of Service",
  description:
    "This summary provides an overview of our Terms of Service that apply to your use of our website and other services.",
};

export default function Terms() {
  return (
    <>
      <ColoredText variant="purple" className="text-6xl">
        Terms of Service
      </ColoredText>
      <div>
        <b>
          The following is a summary of the Terms of Service provided solely for
          your convenience and informational purposes. You must read the
          complete Terms of Service below for the legally binding terms.
        </b>
      </div>
      <div>
        <b>Summary of Terms of Service</b>
      </div>
      <div>
        This summary provides an overview of our Terms of Service that apply to
        your use of our website and other services. This summary isn&apos;t
        legally binding and is purely for informational purposes. While we hope
        this summary section is helpful, please read the complete Terms of
        Service below for the legally binding terms.
      </div>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <b>Eligibility.</b> The Terms of Service sets forth certain criteria
          for your eligibility to use our services.
        </li>
        <li>
          <b>Ink, Our Services, and Third Party Services.</b> Below, you&apos;ll
          find more information about our services, Ink, and Third Party
          Services. For clarity, Ink and Third Party Services are not part of
          our services, and as such we have no obligations or liability to you
          in connection with your use of Ink or Third Party Services. In
          addition, we explain that there are a number of ways in which you are
          prohibited from using our services, some of which are covered below.
        </li>
        <li>
          <b>Availability of Services.</b> Certain services may not be available
          or may only be available in certain jurisdictions. We also may stop
          providing certain services.
        </li>
        <li>
          <b>Content and Feedback.</b> You give us the right to use any content
          you provide, and we will own any feedback, suggestions, or ideas you
          provide related to our website or services.
        </li>
        <li>
          <b>Restrictions.</b> There are also a number of ways in which you are
          prohibited from using our website or services, some of which are
          covered below.
        </li>
        <li>
          <b>Changes.</b> The Terms of Service discuss changes we can make to
          our website, services, or the terms themselves, including how we can
          suspend or terminate the website or services. Changes to the Terms of
          Service, our services, or website may be made at any time, with or
          without notice. Continued use of our services and website is your
          consent to the Terms of Service and any changes to them.
        </li>
        <li>
          <b>Risks and Liability.</b> There are risks associated with using our
          services, Ink, or Third Party Services. The Terms of Service also
          cover your responsibility for taking on risk, limit our liability to
          you, and limit the remedies you may have against us and how you may
          seek those remedies.
        </li>
        <li>
          <b>Dispute Resolution.</b> We hope to avoid disputes, but if there is
          a dispute, you are required to arbitrate disputes with us and the
          manner in which you can seek relief may be limited.
        </li>
      </ul>
      <div>
        <b>The following is the binding and enforceable Terms of Service.</b>
      </div>
      <div>
        <b>Terms of Service</b>
      </div>
      <div className="text-center underline">
        <b>Last Updated: June 13, 2025</b>
      </div>
      <div>
        Please read these Terms of Service (&quot;<b>Terms</b>&quot;) carefully,
        as they are binding and govern your use of our website,{" "}
        <a
          className="text-blue-500 hover:underline"
          href="https://inkonchain.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://inkonchain.com/
        </a>{" "}
        (the &quot;<b>Website</b>&quot;), Interface, Testnet, Kraken Sequencer
        and any content, tools, documentation, features and functionality
        offered on or through our Website (collectively, the &quot;
        <b>Services</b>&quot;). They also govern your use of the Kraken
        Sequencer. By accessing or using our Services, or by submitting any
        content, you agree to these Terms.
      </div>
      <div>
        These Terms may change at any time and without notice, including updates
        to (1) reflect changes to our Services; (2) reflect the addition of new
        services, features, technologies, or offers; (3) address legal,
        regulatory, or security developments; or (4) prevent harm to our
        Services or to those using our Services. These Terms can only be
        modified in writing, and any change will be effective as of the Last
        Updated date set forth above. You should frequently check these Terms
        for updates. If you continue to access or use our Services, after we
        change these Terms, you agree to all our changes.
      </div>
      <div>
        These Terms are a legally binding agreement between &quot;you&quot; (an
        individual, or an entity acting through an authorized individual) and
        Kraken Continuance, Inc., an exempted company incorporated in the Cayman
        Islands (&quot;Kraken,&quot; &quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;).
      </div>
      <div className="border-2 border-gray-300 p-4 my-4 rounded-lg">
        ARBITRATION NOTICE: THESE TERMS CONTAIN AN ARBITRATION AGREEMENT AND A
        CLASS ACTION WAIVER. BY AGREEING TO THESE TERMS, YOU AGREE (A) TO
        RESOLVE ALL DISPUTES (WITH LIMITED EXCEPTION) RELATED TO OUR SERVICES
        AND/OR PRODUCTS OR THE KRAKEN SEQUENCER THROUGH BINDING INDIVIDUAL
        ARBITRATION, WHICH MEANS THAT YOU WAIVE ANY RIGHT TO HAVE THOSE DISPUTES
        DECIDED BY A JUDGE OR JURY, AND (B) TO WAIVE YOUR RIGHT TO PARTICIPATE
        IN CLASS ACTIONS, CLASS ARBITRATIONS, OR REPRESENTATIVE ACTIONS, AS SET
        FORTH BELOW. YOU HAVE THE RIGHT TO OPT-OUT OF THE ARBITRATION AGREEMENT
        AND THE CLASS ACTION WAIVER AS EXPLAINED BELOW.
      </div>
      <div>
        To make these Terms easier to read, we have organized them as follows:
      </div>
      <ul>
        <li>
          Terms of Service
          <ol className="list-decimal pl-5 space-y-2">
            <li>Eligibility</li>
            <li>Ink</li>
            <li>Our Services</li>
            <li>Third Party Services</li>
            <li>Content; Feedback</li>
            <li>Restrictions</li>
            <li>Risks</li>
            <li>Disclaimer of Warranties</li>
            <li>Limitations on Liability</li>
            <li>Indemnification</li>
            <li>
              Dispute Resolution by Binding Arbitration; Class Action Waiver
            </li>
            <li>Governing Law</li>
            <li>Suspension; Termination; Discontinuance</li>
            <li>Personal Data</li>
            <li>Notices</li>
            <li>General</li>
          </ol>
        </li>
      </ul>
      <b>1. Eligibility</b>
      <div>
        To use any of our Services or the Kraken Sequencer, you must meet at
        least the following conditions (&quot;<b>Conditions</b>&quot;):
      </div>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          if you are an individual, be old enough to legally form a binding
          contract in your jurisdiction (in the USA, that&apos;s 18 years old,
          but it may be different where you live),
        </li>
        <li>
          if you are an entity, be duly organized and validly existing under the
          applicable laws of the jurisdiction of your organization,
        </li>
        <li>
          have full power and authority to enter into these Terms without
          violating any other agreement you have made,
        </li>
        <li>not have been restricted from using our services,</li>
        <li>
          if you are an individual, not be located in, under the control of, or
          resident in—or, if you are an entity, not be directly or indirectly
          owned or controlled by any person located in, under the control of, or
          organized or resident in—any sanctioned or embargoed jurisdiction
          (including Crimea, Cuba, Donetsk, Iran, Luhansk, North Korea, Russia
          or Belarus), or any jurisdiction where we may have restricted use of
          any services, and
        </li>
        <li>
          if you are an individual, not be listed on—or, if you are an entity,
          not listed on or be directly or indirectly owned or controlled by any
          person listed on—the Office of Foreign Assets Control of the U.S.
          Department of Treas.ury&apos;s Specially Designated Nationals and
          Blocked Persons List (&quot;<b>SDN</b>&quot;), the U.S. Department of
          Commerce&apos;s Denied Persons List, Consolidated Non-SDN Lists
          available{" "}
          <a
            className="text-blue-500 hover:underline"
            href="https://sanctionssearch.ofac.treas.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          , the United Nations (UN) Security Council Consolidated List available{" "}
          <a
            className="text-blue-500 hover:underline"
            href="https://www.un.org/securitycouncil/content/un-sc-consolidated-list"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          , or regional or foreign government watchlists.
        </li>
      </ul>
      <b>2. Ink</b>
      <div>
        Ink is a layer 2 optimistic rollup protocol for the Ethereum blockchain
        (&quot;Ink&quot;) built on open source software that we do not control.
        Ink includes functionality whereby certain open source smart contracts
        can receive and hold certain digital currency or other digital assets
        (&quot;Digital Assets&quot;) from certain supported blockchain networks
        such as Ethereum (&quot;Supported Networks&quot;), which are then
        represented on Ink (&quot;Bridge Smart Contracts&quot;). The Bridge
        Smart Contract can also be used to withdraw your Digital Assets from Ink
        back to Supported Networks. We do not take possession, custody, or
        control of any Digital Assets on Ink or sent to its Bridge Smart
        Contracts. There is a risk that the open source software, including any
        upgrades, that Ink is built on may introduce bugs, viruses, Trojan
        horses, or other vulnerabilities or changes to Ink that could result in
        a partial or complete disruption of Ink or loss, damage, or destruction
        of your Digital Assets. The Supported Networks, and the types of Digital
        Assets, that are capable of functioning with Ink and the Bridge Smart
        Contracts may also be subject to change at any time. We do not control
        third party applications, including their development or deployment, on
        Ink, or any activity or transactions occurring on Ink.{" "}
        <b>
          Therefore, you acknowledge and agree that Ink, including its Bridge
          Smart Contracts, are not part of our Services, and we have no
          obligations or liability to you in relation to your use of Ink or its
          Bridge Smart Contracts, and you use Ink and its Bridge Smart Contracts
          at your own risk.
        </b>
      </div>
      <b>3. Our Services</b>
      <div>
        <span className="underline">Interface</span>
      </div>
      <div>
        Our Website includes a user interface (the &quot;Interface&quot;) that
        is intended to allow you to more easily interact with certain
        functionalities of Ink, such as the Bridge Smart Contracts. Other third
        parties may deploy their own applications or interfaces to interface
        with Bridge Smart Contracts, and those other applications or interfaces
        are not part of our Services.
      </div>
      <div>
        <span className="underline">Testnet</span>
      </div>
      <div>
        We operate the Ink testnet (the &quot;Testnet&quot;) as a testing
        environment that is intended to reproduce the functionality and
        experience of Ink. The Testnet is intended to allow you to develop
        applications for Ink and otherwise improve the stability, security, and
        design of Ink and applications built for Ink. Any Testnet tokens are for
        testing purposes on the Testnet, have no value, and are not redeemable
        or convertible for any other token or item of value. We may change,
        upgrade, discontinue, suspend, or terminate the Testnet at any time and
        without notice.
      </div>
      <div>
        <span className="underline">Kraken Sequencer</span>
      </div>
      <div>
        Kraken operates a node that receives, records, and combines multiple
        transaction records from Ink into batches, which are then settled to the
        Ethereum blockchain in a specified format (the &quot;Kraken
        Sequencer&quot;). You are not required to use the Kraken Sequencer. If
        you use the Kraken Sequencer, you agree to pay any applicable gas fees,
        which may be modified at any time. Kraken will attempt to provide
        accurate gas fee information in connection with your use of the Kraken
        Sequencer, but such information reflects its estimate of gas fees, which
        may vary from the fees you actually pay to use the Kraken Sequencer and
        interact with Ink. The Kraken Sequencer does not store, take possession,
        custody, or control of your Digital Assets at any time, except for
        receiving applicable gas fees. It also does not have the ability to
        modify, reverse, or otherwise modify any transactions submitted to the
        Ethereum blockchain. Applicable gas fees received in connection with
        your use of the Kraken Sequencer may be modified at any time.
      </div>
      <b>4. Third Party Services</b>
      <div>
        When using our Services, Ink or the Bridge Smart Contracts you may have
        the opportunity to use or interact with third party services. We do not
        verify, approve, monitor, control or endorse any third-party services
        and are not liable to you for third-party services or third-party
        content displayed or otherwise made available on the Services. We are
        not responsible for, and make no representation as to, any third-party
        content or services. Your use of third-party content or services may be
        subject to additional terms and conditions with third-parties, and we
        are not part of those terms or conditions. You may also incur
        third-party fees, such as fees associated with third-party services, or
        other fees, such as gas fees. You&apos;re solely responsible for paying
        all such fees. If any third-party terms and conditions conflict with
        these Terms, you agree that these Terms control. Under no circumstances
        shall we incur any liability, of any kind, to you arising from or
        relating to fees charged to you by third-party content or services
        linked to or accessed through our Services, Ink or the Bridge Smart
        Contracts. Your interactions with third-party services, including Bridge
        Smart Contracts and digital wallets, are governed by their respective
        privacy policies. We are not responsible for their data practices.
      </div>
      <div>
        To use certain of the Services, you may need to connect a compatible
        third-party digital wallet (&quot;Wallet&quot;) with the Services. By
        using a Wallet in connection with the Services, you agree that you are
        using the Wallet under the terms and conditions of the applicable
        third-party provider of such Wallet. Wallets are not associated with,
        maintained by, or affiliated with us. We accept no responsibility or
        liability to you in connection with your use of a Wallet, and we make no
        representations or warranties regarding how the Services or Ink will
        operate or be compatible with any specific Wallet. The private keys
        necessary to access the assets held in a Wallet are not held by us. You
        are solely responsible for maintaining the confidentiality of your
        private keys and you are responsible for any transactions signed with
        your private keys. We reserve the right, in our sole discretion, to
        prohibit certain Wallet addresses from being able to use or engage in
        transactions using the Services.
      </div>
      <b>5. Content; Feedback</b>
      <div>
        <span className="underline">Our Content</span>. We or our licensors own
        (1) our Services, (2) all content, materials, software, and trademarks
        found on them, (3) the selection and arrangement of them, and (4) all
        intellectual property rights in them (collectively, &quot;Our
        Content&quot;). So long as you comply with these Terms, you&apos;re
        permitted to use our Services, and Our Content made available to you as
        part of our Services, but only for your own benefit. We can take away
        this permission at any time for any reason. You don&apos;t have or
        acquire any rights to Our Content beyond the limited, revocable
        permission in the previous sentence.
      </div>
      <div>
        <span className="underline">Your Content</span>. You may have the
        opportunity to transmit content or materials in or through our Services
        (&quot;Your Content&quot;), excluding Personal Data as defined in our{" "}
        <Link
          className="text-blue-500 hover:underline"
          href={EXTERNAL_LINKS.krakenPrivacyNotice}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Notice
        </Link>
        ). You grant us a perpetual, irrevocable, royalty-free, worldwide, fully
        sublicensable, non-exclusive right and license to use and exploit Your
        Content in any manner and for any purpose.
      </div>
      <div>
        <span className="underline">Feedback</span>. You may provide us
        feedback, suggestions, or ideas relating to our Services
        (&quot;Feedback&quot;). You represent and warrant that you have the
        right to provide us any Feedback that you provide. You agree that
        we&apos;ll own all Feedback, and you hereby irrevocably assign all
        right, title, and interest in and to all Feedback to us.
      </div>
      <b>6. Restrictions</b>
      <div>You won&apos;t:</div>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          use Our Content to engage in, pay for, or support any illegal,
          fraudulent, deceptive, or manipulative conduct, including illegal
          gambling activities, money-laundering, or terrorist activities,
        </li>
        <li>
          use Our Content in any way or for any purpose that infringes,
          misappropriates, or otherwise violates any intellectual property
          rights or other rights of us or any third party, or applicable local,
          state, or federal law or regulation, or that is prohibited by these
          Terms,
        </li>
        <li>
          remove, delete, alter, or obscure any trademarks, specifications,
          warranties, or disclaimers, or any intellectual property or
          proprietary rights notices from Our Content,
        </li>
        <li>
          use, export, reexport or transfer any of Our Content for any purpose
          prohibited by U.S. or local export or import control laws and
          regulations,
        </li>
        <li>
          copy, modify, disassemble, decompile, or reverse engineer Our Content
          (except to the extent such restrictions are prohibited by applicable
          law),
        </li>
        <li>
          use (except as expressly permitted in these Terms), license,
          sublicense, sell, resell, transfer, assign, distribute or otherwise
          commercially exploit or make available to any third party Our Content
          in any way,
        </li>
        <li>
          take any action or use Our Content in any manner that could damage,
          destroy, disrupt, disable, impair, overburden, or otherwise impede or
          harm in any manner Our Content, or interfere with any other
          party&apos;s use of Our Content,
        </li>
        <li>
          disrupt, interfere with, violate the security of, or attempt to gain
          unauthorized access to Our Content or any computer network,
        </li>
        <li>
          bypass, breach, avoid, remove, deactivate, impair, descramble, or
          otherwise circumvent any security device, protection, or technological
          measure implemented by us or any of our service providers to protect
          Our Content,
        </li>
        <li>
          use any device, software, or routine that interferes with the function
          of Our Content or transmit in or through Our Content, or use in
          connection with Our Content, any virus, trojan horse, worm, backdoor,
          time bomb, malware, or other software or hardware devices designed to
          permit unauthorized access to, or disable, erase, or otherwise harm,
          any computer, systems, or software,
        </li>
        <li>
          access or use Our Content to build or support products or services
          competitive to our products or Services,
        </li>
        <li>
          use any web scraping, web harvesting, or data extraction methods to
          extract any data from Our Content,
        </li>
        <li>
          create, use, operate, or employ any bots, robots, parsers, spiders,
          scripts, programs, routines, or any other forms of automation to
          engage in any activity on Our Content,
        </li>
        <li>
          develop any third-party applications that interact with Our Content
          without our prior written consent,
        </li>
        <li>
          use or attempt to use Our Content for any person other than yourself,
        </li>
        <li>
          provide false, inaccurate, or misleading information in connection
          with your use of or access to Our Content,
        </li>
        <li>
          violate any applicable law or regulation in connection with your use
          of or access to Our Content; or
        </li>
        <li>
          encourage, permit, or enable any other person or entity to do any of
          the foregoing.
        </li>
      </ul>
      <b>7. Risks</b>
      <div>
        There are substantial risks associated with using our Services, Ink and
        any third party service (including the Bridge Smart Contracts) available
        on Ink, and you should carefully consider whether using them is suitable
        for you in light of your circumstances, knowledge, and financial
        resources. You may be subject to legal and regulatory compliance
        obligations in connection with your use of our Services, Ink , and third
        party services (including Bridge Smart Contracts) available on Ink, and
        you agree that you are solely responsible for your compliance with all
        laws and regulations. You acknowledge and agree that our Services, Ink,
        and third party services available on Ink may incorporate experimental
        and novel technology and that the use of such technology involves a high
        degree of risk, could unexpectedly fail or not perform as intended, and
        may experience cyber-attacks, botting or other malicious activity, or
        other operational or technical difficulties or vulnerabilities related
        to your use of our Services, Ink , and third party services available on
        Ink. You acknowledge and agree that smart contracts execute
        automatically when certain conditions are met, and we do not have the
        ability to reverse a transaction recorded on a public blockchain. You
        are responsible for ensuring that any details you enter in connection
        with a transaction using any smart contracts are accurate and complete.
        You acknowledge and agree that we cannot control how third-party
        exchange platforms quote or value Digital Assets, and we are not
        responsible for any losses you may incur as a result of fluctuations in
        the value of Digital Assets. As such, you acknowledge and agree that
        your use of our Services, Ink and any third party service available on
        Ink, is at your own risk, and that we aren&apos;t liable to you for any
        losses you incur arising from such risks.
      </div>
      <b>8. Disclaimer of Warranties</b>
      <div>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OUR SERVICES AND INK
        ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS.
        WE (AND AS APPLICABLE KRAKEN) EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY
        KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
        NON-INFRINGEMENT RELATING TO OUR SERVICES AND INK. WITHOUT LIMITING THE
        FOREGOING, WE (AND AS APPLICABLE KRAKEN) DISCLAIM THAT (i) OUR SERVICES
        WILL BE AVAILABLE, ACCURATE, SECURE, USEFUL, UNINTERRUPTED OR
        ERROR-FREE; (ii) DEFECTS WITH OUR SERVICES CAN OR WILL BE CORRECTED;
        (iii) THE SERVERS THAT MAKE OUR SERVICES AVAILABLE ARE FREE FROM VIRUSES
        OR OTHER HARMFUL COMPONENTS; (iv) THE SERVICES OR INK WILL BE COMPATIBLE
        WITH ANY OTHER APPLICATION, SYSTEM, DEVICE OR WALLET; AND (v) THAT THE
        SERVICES OR INK WILL PROTECT YOUR ASSETS FROM THEFT, HACKING, CYBER
        ATTACK OR OTHER FORM OF LOSS CAUSED BY THIRD PARTY CONDUCT. WE
        DON&apos;T PROVIDE ANY UPTIME GUARANTEES, AND WE MAY DISCONTINUE MAKING
        OUR SERVICES AVAILABLE TO YOU AT ANY TIME AT OUR SOLE DISCRETION.
      </div>
      <b>9. Limitations on Liability</b>
      <div>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEITHER WE , NOR OUR
        RESPECTIVE DIRECTORS, MEMBERS, EMPLOYEES OR AGENTS WILL BE LIABLE WITH
        RESPECT TO ANY CLAIM, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE),
        OR OTHERWISE, RELATED IN ANY WAY TO THESE TERMS, OUR SERVICES, OR INK
        FOR (1) ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY
        DAMAGES, INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, OR DATA
        AND (2) TO THE EXTENT NOT ALREADY EXCLUDED, ANY AMOUNTS EXCEEDING $100
        UNITED STATES DOLLARS.
      </div>
      <b>10. Indemnification</b>
      <div>
        You agree to defend, indemnify, and hold harmless us, Kraken, and our
        respective officers, directors, members, employees, and agents, from any
        claim, demand, action, damage, loss, cost, or expense (including
        reasonable attorneys&apos; fees) relating to (1) your use of our
        Services, (2) your violation of these Terms, (3) your infringement,
        misappropriation, or violation of the rights of any other person or
        entity, (4) any content, materials, or information (in any form or
        medium) that you submit, post, upload, provide, contribute, or make
        available (or authorize or instruct us to do so) through the Services,
        and (5) any Feedback. If you&apos;re obligated to indemnify us or
        Kraken, we respectively have the right to control any action if we want
        and you cannot settle any action without our consent, unless the
        settlement is only for money damages which you entirely pay.
      </div>
      <b>11. Dispute Resolution By Binding Arbitration; Class Action Waiver</b>
      <div>
        This Dispute Resolution by Binding Arbitration section is referred to in
        the Terms as the &quot;Arbitration Agreement&quot;.{" "}
      </div>
      <div>
        <b>
          PLEASE READ THIS ARBITRATION AGREEMENT CAREFULLY BECAUSE IT REQUIRES
          YOU TO ARBITRATE DISPUTES WITH US OR KRAKEN AND IT LIMITS THE MANNER
          IN WHICH YOU CAN SEEK RELIEF.
        </b>
      </div>
      <span className="underline">Informal Process First</span>
      <div>
        We are always interested in resolving disputes amicably and efficiently,
        and most concerns can be resolved quickly and to your satisfaction by
        emailing user support at legal@inkonchain.com. However, if such efforts
        prove unsuccessful, you may send to us, by email, a written Notice of
        Dispute (&quot;Notice&quot;). The Notice should be sent to
        legal@inkonchain.com and must (a) describe the nature and basis of the
        claim or dispute and (b) set forth the specific relief sought. If we and
        you do not resolve the claim or dispute set out in the Notice within
        sixty (60) calendar days from the date of receipt, we or you may
        commence an arbitration proceeding. It is agreed that this dispute
        resolution procedure is a condition precedent which must be satisfied
        before initiating arbitration.
      </div>
      <span className="underline">Arbitration and its Terms</span>
      <div>
        Subject to the informal process outlined in the preceding paragraph, you
        and us agree to arbitrate any dispute arising in connection with these
        Terms (including questions related to their validity, existence, or
        termination) or your use of the Services, except for disputes in which
        either party seeks equitable and other relief for the alleged unlawful
        use of copyrights, trademarks, trade names, logos, trade secrets or
        patents.{" "}
      </div>
      <div>
        The arbitration will be administered in accordance with the Rules of the
        London Court of International Arbitration then in effect (the &quot;LCIA
        Rules&quot;). It will be conducted in English and the parties will keep
        the arbitration proceedings confidential and not disclose any
        information regarding the arbitration (or any underlying claim or
        dispute) to any third party except as required by law.
      </div>
      <div>
        Other than class procedures and remedies expressly prohibited by this
        Arbitration Agreement, the arbitrator(s) will have the authority to
        provide any remedy or relief that a court of competent jurisdiction
        could award, including injunctive relief. Any decision or award rendered
        by the arbitrator will be final and binding, and may be overturned by a
        court only for very limited reasons. Any judgment may be entered in any
        court of competent jurisdiction.{" "}
      </div>
      <div>
        If there is any inconsistency between any term of the LCIA Rules and any
        term of this Arbitration Agreement, the applicable terms of this
        Arbitration Agreement will control unless the arbitrator determines that
        the application of the inconsistent Arbitration Agreement terms would
        not result in a fundamentally fair arbitration. The arbitrator must also
        follow the provisions of these Terms as a court would.
      </div>
      <div>
        <b>
          It is expressly agreed that any arbitration under these Terms will
          take place on an individual basis – class arbitrations and class
          action are not permitted. You understand that by agreeing to these
          Terms, you and us are each waiving the right to trial by jury or to
          participate in a class action or class arbitration.
        </b>
      </div>
      <span className="underline">Costs of Arbitration</span>
      <div>
        Payment of all filing, administration and arbitrator costs and expenses
        will be governed by the LCIA Rules then in effect, except that if you
        demonstrate that any such costs and expenses owed by you under those
        rules would be prohibitively more expensive than a court proceeding,
        then we will pay the amount of any such costs and expenses that the
        arbitrator determines are necessary to prevent the arbitration from
        being prohibitively more expensive than a court proceeding.
      </div>
      <div>
        Fees and costs may be awarded as provided pursuant to applicable law.
        The arbitrator may make rulings and resolve disputes as to the payment
        and reimbursement of fees or expenses at any time during the proceeding
        and upon request from either party made within 14 days of the
        arbitrator&apos;s ruling on the merits.
      </div>
      <span className="underline">Batch Arbitration</span>
      <div>
        To increase the efficiency of administration and resolution of
        arbitrations, you and us agree that in the event that there are
        one-hundred (100) or more individual claims of a substantially similar
        nature filed against us by or with the assistance of the same law firm,
        group of law firms, or organizations, then within a thirty (30) day
        period (or as soon as possible thereafter), the LCIA shall (a)
        administer the arbitration demands in batches of one-hundred (100)
        claims per batch (plus, to the extent there are less than one-hundred
        (100) claims left over after the batching described above, a final batch
        consisting of the remaining claims); (b) appoint one arbitrator for each
        batch; and (c) provide for the resolution of each batch as a single
        consolidated arbitration with one set of filing and administrative fees
        due per side per batch, one procedural calendar, one hearing (if any) in
        a place to be determined by the arbitrator, and one final award
        (&quot;Batch Arbitration&quot;). All parties agree that claims are of a
        &quot;substantially similar nature&quot; if they arise out of or relate
        to the same event or factual scenario and raise the same or similar
        legal issues and seek the same or similar relief. To the extent the
        parties disagree on the application of the Batch Arbitration process,
        the disagreeing party shall advise the LCIA, and the LCIA shall appoint
        a sole standing arbitrator to determine the applicability of the Batch
        Arbitration process (&quot;Administrative Arbitrator&quot;). In an
        effort to expedite resolution of any such dispute by the Administrative
        Arbitrator, the parties agree the Administrative Arbitrator may set
        forth such procedures as are necessary to resolve any disputes promptly.
        The Administrative Arbitrator&apos;s fees shall be paid by us. You and
        us agree to cooperate in good faith with the LCIA to implement the Batch
        Arbitration process including the payment of single filing and
        administrative fees for batches of claims, as well as any steps to
        minimize the time and costs of arbitration, which may include: (i) the
        appointment of a discovery special master to assist the arbitrator in
        the resolution of discovery disputes; and (ii) the adoption of an
        expedited calendar of the arbitration proceedings. This Batch
        Arbitration provision shall in no way be interpreted as authorizing a
        class, collective and/or mass arbitration or action of any kind, or
        arbitration involving joint or consolidated claims under any
        circumstances, except as expressly set forth in this provision.
      </div>
      <span className="underline">
        <b>
          Waiver of Right to Bring Class Action and Representative Claims; Jury
          Trial Waiver.{" "}
        </b>
      </span>
      <div>
        WE AND YOU EACH AGREE TO WAIVE ANY RIGHT TO A TRIAL BY JURY. ANY CLAIM
        OR DISPUTE WILL BE DETERMINED BY A NEUTRAL ARBITRATOR AS STIPULATED IN
        THIS ARBITRATION AGREEMENT, NOT A JUDGE OR JURY.
      </div>
      <div>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AND US EACH AGREE
        THAT ANY PROCEEDING TO RESOLVE ANY DISPUTE, CLAIM, OR CONTROVERSY WILL
        BE BROUGHT AND CONDUCTED ONLY IN THE RESPECTIVE PARTY&apos;S INDIVIDUAL
        CAPACITY AND NOT AS PART OF ANY CLASS (OR PURPORTED CLASS),
        CONSOLIDATED, MULTIPLE-PLAINTIFF, OR REPRESENTATIVE ACTION OR PROCEEDING
        (&quot;CLASS ACTION&quot;).{" "}
      </div>
      <div>
        YOU AND US AGREE TO WAIVE THE RIGHT TO PARTICIPATE AS A PLAINTIFF OR
        CLASS MEMBER IN ANY CLASS ACTION. YOU AND US EXPRESSLY WAIVE ANY ABILITY
        TO MAINTAIN A CLASS ACTION IN ANY FORUM.{" "}
      </div>
      <div>
        IF THE DISPUTE IS SUBJECT TO ARBITRATION, THE ARBITRATOR WILL NOT HAVE
        THE AUTHORITY TO COMBINE OR AGGREGATE CLAIMS, CONDUCT A CLASS ACTION, OR
        MAKE AN AWARD TO ANY PERSON OR ENTITY NOT A PARTY TO THE ARBITRATION .
        FURTHER, YOU AND US AGREE THAT THE ARBITRATOR MAY NOT CONSOLIDATE
        PROCEEDINGS FOR MORE THAN ONE PERSON&apos;S CLAIMS, AND IT MAY NOT
        OTHERWISE PRESIDE OVER ANY FORM OF A CLASS ACTION (OTHER THAN THE BATCH
        ARBITRATION SPECIFIED ABOVE). FOR THE AVOIDANCE OF DOUBT, HOWEVER, YOU
        CAN SEEK PUBLIC INJUNCTIVE RELIEF TO THE EXTENT AUTHORIZED BY LAW AND
        CONSISTENT WITH THE EXCEPTIONS DESCRIBED ABOVE.
      </div>
      <div>
        IF THIS CLASS ACTION WAIVER IS LIMITED, VOIDED, OR FOUND UNENFORCEABLE,
        THEN, UNLESS THE PARTIES MUTUALLY AGREE OTHERWISE, THE PARTIES&apos;
        AGREEMENT TO ARBITRATE SHALL BE NULL AND VOID WITH RESPECT TO SUCH
        PROCEEDING SO LONG AS THE PROCEEDING IS PERMITTED TO PROCEED AS A CLASS
        ACTION. If a court decides that the limitations of this paragraph are
        deemed invalid or unenforceable, any putative class, private attorney
        general, or consolidated or representative action must be brought in a
        court of proper jurisdiction and not in arbitration. You acknowledge and
        agree that this Arbitration Agreement applies equally to any claims or
        disputes between you and Kraken in connection with any dispute that
        arises in relation to your use of the Kraken Sequencer, and notices to
        Kraken may be provided to legal@kraken.com.
      </div>
      <span className="underline">
        <b>Opt-Out</b>
      </span>
      <div>
        You have the right to opt-out and not be bound by the Arbitration
        Agreement contained in these Terms by sending written notice of your
        decision to opt-out to legal@inkonchain.com. The notice must be sent to
        us within thirty (30) days of your first registering to use the Services
        or agreeing to these Terms; otherwise you shall be bound to arbitrate
        disputes on a non-class basis in accordance with these Terms. If you opt
        out of only the arbitration provisions, and not also the class action
        waiver, the class action waiver still applies. You may not opt out of
        only the class action waiver and not also the arbitration provisions. If
        you opt-out of these arbitration provisions, we also will not be bound
        by them.
      </div>

      <b>12. Governing Law</b>
      <div>
        These Terms, your use of the Services and any disputes arising out of or
        related thereto is governed by the laws of the Cayman Islands, without
        regard to its conflict of law provisions or principles.
      </div>

      <b>13. Suspension; Termination; Discontinuance</b>
      <div>
        We can, at any time and without liability or prior notice to you:
      </div>
      <ul className="list-disc pl-5 space-y-2">
        <li>modify or discontinue our Services (or any parts of them),</li>
        <li>suspend, restrict, or terminate your access to our Services, or</li>
        <li>suspend, restrict, or delete Your Content.</li>
      </ul>
      <div>
        You may terminate your use of our Services at any time by ceasing to
        access or use our Services.
      </div>

      <b>14. Personal Data</b>
      <div>
        Please read the{" "}
        <Link
          className="text-blue-500 hover:underline"
          href={EXTERNAL_LINKS.krakenPrivacyNotice}
          target="_blank"
          rel="noopener noreferrer"
        >
          Kraken Privacy Notice
        </Link>
        , for information about how your personal data may be collected, used,
        and shared. The Kraken Privacy Notice is incorporated into these Terms
        by reference.
      </div>

      <b>15. Notices</b>
      <div>
        You agree that we may electronically provide you all communications,
        agreements, documents, notices, and disclosures
        (&quot;Communications&quot;) in connection with your access or use of
        our Services. You agree that we may provide Communications to you by
        posting them on our Services, by emailing them to you at the email
        address you provide, or by sending an SMS or text message to a mobile
        phone number that you provide. Your carrier&apos;s normal messaging,
        data, and other rates and fees may apply to any mobile Communications.
        You should retain copies of all Communications for your records. You may
        withdraw your consent to receive electronic Communications by sending a
        withdrawal notice via the contact form on our website. If you do, we may
        suspend or terminate your use of our Services.
      </div>

      <b>16. General</b>
      <div className="underline">Force Majeure.</div>
      <div>
        We are not responsible or liable for any error, delay, loss, or damage
        arising from any event beyond our reasonable control (each, a
        &quot;Force Majeure Event&quot;). Force Majeure Events include flood,
        extraordinary weather conditions, earthquake, or other act of God, fire,
        war, insurrection, riot, labor dispute, accident, action of government,
        communications, power failure, or equipment or software malfunction.
      </div>
      <div className="underline">Injunctive Relief.</div>
      <div>
        You agree that a breach of these Terms will cause irreparable injury to
        us for which monetary damages would not be an adequate remedy and we are
        entitled to equitable relief in addition to any remedies we may have
        hereunder or at law without a bond, other security or proof of damages.
      </div>
      <div className="underline">Taxes</div>
      <div>
        You alone are responsible for determining what taxes apply to your use
        of our Services, Ink (including the Bridge Smart Contracts) and any
        third party service available on Ink, and for reporting and remitting
        the correct taxes to the appropriate tax authorities. You agree that we
        have no responsibility or liability for determining what taxes apply or
        for collecting, reporting, withholding, or remitting any taxes arising
        from any trades or transactions, unless otherwise required by law.
      </div>
      <div className="underline">Waiver.</div>
      <div>
        If we don&apos;t exercise a right under these Terms, we are not waiving
        such right.
      </div>
      <div className="underline">Enforceability.</div>
      <div>
        If any provision of these Terms is invalid or unenforceable, such
        provision will be deemed severed from these Terms, but such invalidity
        or unenforceability won&apos;t affect any other part of these Terms and
        the rest of these Terms will remain in full force and effect; provided,
        however, that if any such invalid or unenforceable provision can be
        modified so as to be valid and enforceable as a matter of law, then such
        provision is not deemed severed from these Terms and instead is deemed
        to have been modified so as to be valid and enforceable to the maximum
        extent permitted by law.
      </div>
      <div className="underline">Assignment.</div>
      <div>
        You cannot assign or transfer any right or obligation under these Terms
        without our prior written consent. We can assign or transfer any right
        or obligation under these Terms, in whole or in part, without your
        consent, subject to compliance with applicable laws. In addition, if we
        are acquired by or merged with a third-party entity, we reserve the
        right to transfer or assign the information we have collected from you
        as part of such merger, acquisition, sale, or other change of control.
      </div>
      <div className="underline">Interpretation.</div>
      <div>
        In these Terms, (1) &quot;or&quot; is inclusive, (2)
        &quot;including&quot; or &quot;such as&quot; aren&apos;t words of
        limitation, (3) headings are only for your convenience, and (4) the
        &quot;Summary of Terms of Service&quot; and any definitions provided
        only for &quot;informational purposes&quot; are provided only for your
        convenience, is not legally binding, and does not affect the
        interpretation of these Terms.
      </div>
      <div className="underline">Relationship.</div>
      <div>
        We don&apos;t provide investment or tax advice, including in connection
        with your use of our Services. You agree not to rely upon any statement
        or content on our Services, or that is otherwise attributed to us, as a
        recommendation, advice, or guidance regarding trades, investments, tax,
        or any other similar issues. We also are not acting as your bank,
        broker, intermediary, agent, advisor, or as your fiduciary in any
        capacity, including with respect to the services.
      </div>
      <div>
        Nothing in these Terms will be deemed to or is intended to be deemed to,
        nor will it, cause you and us to be treated as partners, joint
        venturers, or otherwise as joint associates for profit.
      </div>
      <div className="underline">California Residents.</div>
      <div>
        If you are a California resident, in accordance with Cal. Civ. Code §
        1789.3, you may report complaints to the Complaint Assistance Unit of
        the Division of Consumer Services of the California Department of
        Consumer Affairs by contacting them in writing at 1625 North Market
        Blvd., Suite N 112 Sacramento, CA 95834, or by telephone at (800)
        952-5210.
      </div>

      <div className="underline">Survival.</div>
      <div>
        All sections which by their nature should survive the termination of
        these Terms shall continue in full force and effect subsequent to and
        notwithstanding any termination of these Terms by you or us. Termination
        won&apos;t limit any of our rights or remedies at law or equity.
      </div>
      <div className="underline">Entire Agreement.</div>
      <div>
        These Terms are the entire agreement between you and us, and supersede
        all prior and contemporaneous understandings between you and us about
        our Services
      </div>
    </>
  );
}
