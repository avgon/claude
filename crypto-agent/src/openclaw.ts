/**
 * OpenClaw smart legal contract template generator.
 *
 * Produces Ricardian-style contract templates that bridge legal prose
 * with smart contract execution parameters. Templates use OpenClaw/OpenLaw
 * markup conventions with variable interpolation.
 */

// ---------- template registry ----------

type TemplateGenerator = (params: Record<string, string>) => OpenClawOutput;

interface OpenClawOutput {
  success: boolean;
  template_type: string;
  title: string;
  markup: string;
  variables: Record<string, string>;
  solidity_interface: string;
  notes: string[];
}

function vestingTemplate(params: Record<string, string>): OpenClawOutput {
  const p = {
    beneficiary: params.beneficiary || '[[Beneficiary Wallet Address]]',
    token: params.token || '[[Token Symbol]]',
    totalAmount: params.totalAmount || '[[Total Token Amount]]',
    cliffMonths: params.cliffMonths || '12',
    vestingMonths: params.vestingMonths || '48',
    startDate: params.startDate || '[[Start Date]]',
    company: params.company || '[[Company Name]]',
  };

  return {
    success: true,
    template_type: 'vesting',
    title: 'Token Vesting Agreement',
    markup: `
# Token Vesting Agreement

**Effective Date:** ${p.startDate}

## Parties

1. **Company:** ${p.company} ("Company")
2. **Beneficiary:** Wallet address \`${p.beneficiary}\` ("Recipient")

## Grant Details

| Parameter        | Value                |
|-----------------|----------------------|
| Token            | ${p.token}           |
| Total Amount     | ${p.totalAmount}     |
| Cliff Period     | ${p.cliffMonths} months |
| Total Vesting    | ${p.vestingMonths} months |
| Start Date       | ${p.startDate}       |

## Vesting Schedule

The Recipient shall receive **${p.totalAmount} ${p.token}** tokens subject to the
following vesting schedule:

1. **Cliff:** No tokens shall vest during the first ${p.cliffMonths} months
   following the Start Date.
2. **Linear Vesting:** After the Cliff Period, tokens shall vest linearly on a
   monthly basis over the remaining ${parseInt(p.vestingMonths) - parseInt(p.cliffMonths)} months.
3. **Acceleration:** In the event of a Change of Control (as defined in
   Schedule A), 100% of unvested tokens shall immediately vest.

## Smart Contract Execution

The vesting schedule SHALL be enforced by a smart contract deployed at
\`[[Contract Address]]\` on \`[[Network]]\`. The contract implements the
\`IVesting\` interface defined below.

## Termination

Upon termination of the Recipient's engagement:
- **For Cause:** All unvested tokens are forfeited immediately.
- **Without Cause:** Vesting continues for 3 additional months, then unvested
  tokens are forfeited.

## Governing Law

This Agreement shall be governed by the laws of \`[[Jurisdiction]]\`.

> **ATTORNEY REVIEW REQUIRED:** This template requires customization for your
> jurisdiction and specific legal requirements.
`.trim(),
    variables: p,
    solidity_interface: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IVesting {
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        uint256 released;
        bool revoked;
    }

    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);

    function createSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external;

    function release() external;
    function revoke(address beneficiary) external;
    function vestedAmount(address beneficiary) external view returns (uint256);
    function releasableAmount(address beneficiary) external view returns (uint256);
}
`.trim(),
    notes: [
      'Cliff and vesting durations should be validated against local employment law.',
      'Acceleration clause may have tax implications - consult tax advisor.',
      'Smart contract should be audited before deployment.',
      'Consider adding a multi-sig requirement for revocation.',
    ],
  };
}

function saftTemplate(params: Record<string, string>): OpenClawOutput {
  const p = {
    investor: params.investor || '[[Investor Name]]',
    company: params.company || '[[Company Name]]',
    purchaseAmount: params.purchaseAmount || '[[Purchase Amount USD]]',
    tokenPrice: params.tokenPrice || '[[Token Price USD]]',
    discount: params.discount || '20',
    valuationCap: params.valuationCap || '[[Valuation Cap USD]]',
    network: params.network || '[[Target Network]]',
    token: params.token || '[[Token Symbol]]',
  };

  return {
    success: true,
    template_type: 'saft',
    title: 'Simple Agreement for Future Tokens (SAFT)',
    markup: `
# Simple Agreement for Future Tokens (SAFT)

## Parties

1. **Company:** ${p.company} (the "Company")
2. **Investor:** ${p.investor} (the "Purchaser")

## Purchase

The Purchaser agrees to pay **$${p.purchaseAmount} USD** to the Company in
exchange for the right to receive tokens upon a Network Launch Event.

## Token Allocation

| Parameter       | Value              |
|----------------|---------------------|
| Purchase Amount | $${p.purchaseAmount} |
| Token Price     | $${p.tokenPrice}    |
| Discount Rate   | ${p.discount}%      |
| Valuation Cap   | $${p.valuationCap}  |
| Network         | ${p.network}        |
| Token           | ${p.token}          |

## Conversion Events

### Network Launch
Upon the bona fide public launch of ${p.network}, the Company shall deliver
to the Purchaser a number of ${p.token} tokens equal to:

\`\`\`
tokens = purchaseAmount / min(tokenPrice, discountedPrice)
discountedPrice = tokenPrice * (1 - ${p.discount}/100)
\`\`\`

Subject to the Valuation Cap of $${p.valuationCap}.

### Dissolution Event
If the Company dissolves before a Network Launch Event, the Purchaser shall
receive a return of the Purchase Amount, with priority over common stockholders
but subordinate to creditors.

### Change of Control
In a Change of Control event, the Purchaser may elect to:
(a) receive a cash return of the Purchase Amount, or
(b) convert to tokens at the Discount Rate.

## Representations

The Purchaser represents that they are an accredited investor as defined by
SEC Regulation D, Rule 501.

## Governing Law

This Agreement is governed by the laws of \`[[Jurisdiction]]\` and subject to
binding arbitration under \`[[Arbitration Rules]]\`.

> **SECURITIES LAW NOTICE:** SAFTs may constitute securities. This template
> requires review by qualified securities counsel before use.
`.trim(),
    variables: p,
    solidity_interface: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISAFT {
    struct Agreement {
        address investor;
        uint256 purchaseAmount;
        uint256 tokenPrice;
        uint256 discountBps;    // basis points (2000 = 20%)
        uint256 valuationCap;
        bool converted;
        bool refunded;
    }

    event TokensConverted(address indexed investor, uint256 tokenAmount);
    event PurchaseRefunded(address indexed investor, uint256 amount);

    function recordPurchase(address investor, uint256 amount) external;
    function convertTokens(address investor) external;
    function refund(address investor) external;
    function tokenAllocation(address investor) external view returns (uint256);
}
`.trim(),
    notes: [
      'SAFT agreements are subject to securities regulations - legal review is mandatory.',
      'Ensure KYC/AML compliance for all purchasers.',
      'Discount rate and valuation cap interact - model edge cases.',
      'Consider adding lock-up periods post-conversion.',
      'Tax treatment varies by jurisdiction - consult tax counsel.',
    ],
  };
}

function daoCharterTemplate(params: Record<string, string>): OpenClawOutput {
  const p = {
    daoName: params.daoName || '[[DAO Name]]',
    token: params.token || '[[Governance Token]]',
    quorum: params.quorum || '10',
    votingPeriod: params.votingPeriod || '7',
    timelockDelay: params.timelockDelay || '48',
    treasury: params.treasury || '[[Treasury Multi-Sig Address]]',
    wrapper: params.wrapper || 'Cayman Islands Foundation',
  };

  return {
    success: true,
    template_type: 'dao-charter',
    title: 'DAO Charter & Governance Framework',
    markup: `
# ${p.daoName} - DAO Charter

## Article I: Organization

**${p.daoName}** is a decentralized autonomous organization operating through
on-chain governance with a **${p.wrapper}** legal wrapper.

## Article II: Governance Token

The **${p.token}** token confers voting rights proportional to holdings.
One token equals one vote. Delegation is permitted.

## Article III: Proposal Lifecycle

| Phase          | Duration / Threshold     |
|---------------|--------------------------|
| Discussion     | Minimum 3 days on forum  |
| Temperature Check | Snapshot vote, 1% quorum |
| On-Chain Vote  | ${p.votingPeriod} days   |
| Quorum         | ${p.quorum}% of supply   |
| Timelock       | ${p.timelockDelay} hours |
| Execution      | Automatic via Governor   |

### Proposal Types
1. **Standard:** Treasury disbursements, parameter changes
2. **Constitutional:** Charter amendments (requires 67% supermajority)
3. **Emergency:** Guardian multi-sig can fast-track with 24h timelock

## Article IV: Treasury

The DAO treasury is held at \`${p.treasury}\` and governed by:
- **Spending < $10,000:** Core contributor approval
- **Spending $10,000-$100,000:** Standard proposal vote
- **Spending > $100,000:** Constitutional proposal vote

## Article V: Dispute Resolution

1. Internal mediation via elected Dispute Committee (3 members)
2. If unresolved: binding arbitration under ICC Rules
3. Governing law: Laws of the jurisdiction of the legal wrapper entity

## Article VI: Contributor Rights

Contributors are classified as:
- **Core:** Full-time, token compensation + salary
- **Part-time:** Bounty-based compensation
- **Community:** Retroactive public goods funding

## Article VII: Amendments

This Charter may be amended by Constitutional Proposal achieving
67% supermajority with ${p.quorum}% quorum.

> **LEGAL WRAPPER NOTE:** DAO legal wrapper structure must be reviewed by
> counsel specializing in the chosen jurisdiction.
`.trim(),
    variables: p,
    solidity_interface: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDAOGovernor {
    enum ProposalType { Standard, Constitutional, Emergency }
    enum ProposalState { Pending, Active, Succeeded, Defeated, Queued, Executed, Cancelled }

    event ProposalCreated(uint256 indexed proposalId, address proposer, ProposalType pType);
    event VoteCast(uint256 indexed proposalId, address voter, bool support, uint256 weight);

    function propose(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas,
        string calldata description,
        ProposalType pType
    ) external returns (uint256 proposalId);

    function castVote(uint256 proposalId, bool support) external;
    function queue(uint256 proposalId) external;
    function execute(uint256 proposalId) external;
    function state(uint256 proposalId) external view returns (ProposalState);
    function quorumReached(uint256 proposalId) external view returns (bool);
}
`.trim(),
    notes: [
      'Legal wrapper jurisdiction affects tax treatment and liability.',
      'Quorum thresholds should be modeled against current token distribution.',
      'Emergency proposals need guardrails to prevent governance attacks.',
      'Consider vote-escrowed token model (veToken) for long-term alignment.',
      'Treasury diversification policy should be defined separately.',
    ],
  };
}

function serviceAgreementTemplate(params: Record<string, string>): OpenClawOutput {
  const p = {
    provider: params.provider || '[[Service Provider]]',
    client: params.client || '[[Client / DAO Name]]',
    scope: params.scope || '[[Scope of Work Description]]',
    compensation: params.compensation || '[[Total Compensation]]',
    token: params.token || '[[Payment Token]]',
    duration: params.duration || '6',
    milestones: params.milestones || '4',
  };

  return {
    success: true,
    template_type: 'service-agreement',
    title: 'Web3 Service Agreement',
    markup: `
# Web3 Service Agreement

**Effective Date:** [[Effective Date]]

## Parties

1. **Client:** ${p.client}
2. **Service Provider:** ${p.provider}

## Scope of Work

${p.scope}

## Compensation

| Parameter     | Value              |
|--------------|---------------------|
| Total Amount  | ${p.compensation}  |
| Payment Token | ${p.token}         |
| Duration      | ${p.duration} months |
| Milestones    | ${p.milestones}    |

## Payment Schedule

Payments released via smart contract escrow upon milestone completion:

${Array.from({ length: parseInt(p.milestones) }, (_, i) => {
  const pct = Math.round(100 / parseInt(p.milestones));
  return `${i + 1}. **Milestone ${i + 1}:** [[Description]] - ${pct}% of compensation`;
}).join('\n')}

## Intellectual Property

All work product created under this Agreement shall be:
- **Open Source contributions:** Licensed under [[License]] and owned by ${p.client}
- **Proprietary work:** Assigned to ${p.client} upon payment of final milestone

## Confidentiality

Provider agrees not to disclose non-public information including:
- Private keys, seed phrases, or wallet credentials
- Unannounced protocol upgrades or token launches
- Security vulnerabilities prior to public disclosure

## Termination

Either party may terminate with 30 days written notice. Upon termination:
- Completed milestones are paid in full
- Partial milestones paid pro-rata based on deliverables
- Escrowed funds for incomplete milestones returned to Client

## Dispute Resolution

Disputes resolved via:
1. Good faith negotiation (14 days)
2. Mediation via [[Mediation Service]]
3. Binding arbitration under [[Arbitration Rules]]

> **NOTE:** This template should be reviewed by legal counsel familiar with
> your jurisdiction and the specific nature of the services.
`.trim(),
    variables: p,
    solidity_interface: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IServiceEscrow {
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool disputed;
    }

    event MilestoneCompleted(uint256 indexed milestoneId, uint256 amount);
    event PaymentReleased(address indexed provider, uint256 amount);
    event DisputeRaised(uint256 indexed milestoneId, address raisedBy);

    function createAgreement(
        address provider,
        uint256[] calldata milestoneAmounts,
        string[] calldata descriptions
    ) external payable;

    function completeMilestone(uint256 milestoneId) external;
    function releasPayment(uint256 milestoneId) external;
    function raiseDispute(uint256 milestoneId) external;
    function resolveDispute(uint256 milestoneId, bool inFavorOfProvider) external;
}
`.trim(),
    notes: [
      'Escrow contract should support ERC-20 tokens, not just ETH.',
      'Consider adding a dispute resolution timelock.',
      'IP assignment clauses may need to reference specific jurisdictions.',
      'Milestone acceptance criteria should be as specific as possible.',
      'Multi-sig approval for milestone completion adds trust.',
    ],
  };
}

function escrowTemplate(params: Record<string, string>): OpenClawOutput {
  const p = {
    buyer: params.buyer || '[[Buyer Address]]',
    seller: params.seller || '[[Seller Address]]',
    arbiter: params.arbiter || '[[Arbiter Address]]',
    amount: params.amount || '[[Escrow Amount]]',
    token: params.token || 'ETH',
    releaseCondition: params.releaseCondition || '[[Release Condition Description]]',
    disputeWindow: params.disputeWindow || '7',
  };

  return {
    success: true,
    template_type: 'escrow',
    title: 'Smart Escrow Agreement',
    markup: `
# Smart Escrow Agreement

## Parties

1. **Buyer:** \`${p.buyer}\`
2. **Seller:** \`${p.seller}\`
3. **Arbiter:** \`${p.arbiter}\`

## Escrow Terms

| Parameter         | Value              |
|------------------|---------------------|
| Amount            | ${p.amount} ${p.token} |
| Release Condition | ${p.releaseCondition} |
| Dispute Window    | ${p.disputeWindow} days |

## Process

1. **Deposit:** Buyer deposits ${p.amount} ${p.token} into the escrow contract.
2. **Fulfillment:** Seller fulfills the agreed condition: ${p.releaseCondition}
3. **Confirmation:** Buyer confirms receipt and triggers release.
4. **Dispute Window:** If Buyer does not confirm within ${p.disputeWindow} days,
   Seller may request Arbiter review.
5. **Resolution:** Arbiter can release funds to either party.

## Arbiter Role

The Arbiter:
- Cannot access funds directly
- Can only direct release to Buyer OR Seller
- Must provide written reasoning for disputes
- Earns a 1% arbitration fee only if dispute is raised

## Automatic Release

If neither party raises a dispute within ${p.disputeWindow} days of Seller
marking fulfillment, funds are automatically released to Seller.

## Governing Smart Contract

The escrow is enforced by a smart contract at \`[[Contract Address]]\` on
\`[[Network]]\`. The contract is immutable and non-upgradeable.

> **SECURITY NOTE:** Escrow contract should be audited. Consider using a
> time-tested implementation like OpenZeppelin's PaymentSplitter as a base.
`.trim(),
    variables: p,
    solidity_interface: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEscrow {
    enum State { Created, Funded, Fulfilled, Released, Disputed, Resolved }

    event Funded(address indexed buyer, uint256 amount);
    event FulfillmentClaimed(address indexed seller);
    event Released(address indexed recipient, uint256 amount);
    event DisputeRaised(address indexed raisedBy);
    event DisputeResolved(address indexed arbiter, address recipient);

    function deposit() external payable;
    function claimFulfillment() external;
    function confirmAndRelease() external;
    function raiseDispute() external;
    function resolveDispute(address payable recipient) external;
    function autoRelease() external;
    function getState() external view returns (State);
}
`.trim(),
    notes: [
      'Consider supporting ERC-20 tokens in addition to native ETH.',
      'Auto-release timer should use block timestamps with buffer for clock drift.',
      'Arbiter selection could be decentralized via Kleros or similar.',
      'Add re-entrancy guards to all fund-transferring functions.',
      'Consider adding partial release capability for milestone-based deals.',
    ],
  };
}

// ---------- registry ----------

const TEMPLATES: Record<string, TemplateGenerator> = {
  vesting: vestingTemplate,
  saft: saftTemplate,
  'dao-charter': daoCharterTemplate,
  'service-agreement': serviceAgreementTemplate,
  escrow: escrowTemplate,
};

// ---------- public API ----------

export function generateTemplate(
  templateType: string,
  params: Record<string, string> = {},
): OpenClawOutput {
  const generator = TEMPLATES[templateType];
  if (!generator) {
    const available = Object.keys(TEMPLATES).join(', ');
    throw new Error(`Unknown template type: "${templateType}". Available: ${available}`);
  }
  return generator(params);
}

export function listTemplates(): string[] {
  return Object.keys(TEMPLATES);
}
