--- 
title: registrations_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - registrations_v3
  - registration
  - godaddy
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage godaddy resources using SQL
custom_edit_url: null
image: /img/stackql-godaddy-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

GoDaddy Domains v3 API (Personal Access Token only). Mutations are asynchronous and return an operation to poll via domains.operations_v3.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="registrations_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.registrations_v3" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

Registration record returned.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="operation_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122). (example: 9f1c2e7a-4b3d-4e8f-a1c2-3d4e5f6a7b8c) (wire: operationId)</td>
</tr>
<tr>
    <td><CopyableCode code="profile_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122). (wire: profileId)</td>
</tr>
<tr>
    <td><CopyableCode code="registration_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122). (wire: registrationId)</td>
</tr>
<tr>
    <td><CopyableCode code="consent" /></td>
    <td><code>object</code></td>
    <td>Customer consent record for a domain operation, capturing which legal agreements were accepted, which fees were acknowledged, when, and by whom. On execute, the caller supplies agreementTypes, agreedAt, and (when the quote carries fees) acknowledgedFees. The server derives agreedBy from the authenticated request context (OAuth identity, X-Shopper-Id, client IP, and transmission channel).  (title: Consent)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain name to register, in punycode A-label form for IDNs. Must match the domain in the quoteToken.  (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="expires_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: expiresAt)</td>
</tr>
<tr>
    <td><CopyableCode code="fees" /></td>
    <td><code>array</code></td>
    <td>Fees charged at the time of purchase, in addition to the registration price. Present when purchase fees were incurred. Same fees as RegistrationQuote.fees (the selected term's TermPrice.fees) from the preceding quote. </td>
</tr>
<tr>
    <td><CopyableCode code="links" /></td>
    <td><code>array</code></td>
    <td>HATEOAS link relations for this registration. rel=self — the canonical URL for this registration record. rel=domain — the registered domain-name resource once the registration is complete. </td>
</tr>
<tr>
    <td><CopyableCode code="period" /></td>
    <td><code>integer</code></td>
    <td>Registration period in years. Must match the period in the quote.</td>
</tr>
<tr>
    <td><CopyableCode code="price" /></td>
    <td><code>object</code></td>
    <td>The currency and amount for a financial transaction, such as a balance or payment due. Use for value representations with default transactable-value precision. (title: Simple Money)</td>
</tr>
<tr>
    <td><CopyableCode code="profile" /></td>
    <td><code>object</code></td>
    <td>A one-time, non-persisted set of contacts and purchase preference defaults supplied inline on a quote or execute request. Use to provide registration data for this transaction without creating or updating a saved registration profile. Shared by the registration quote and execute request bodies. Every field is optional. Omitted fields account identity or other default values. Provided fields override only what is supplied — contact roles replace as a whole block; preference fields replace individually. This is not a saved registration profile and is not JSON Patch. Data here applies only to the current quote or registration request.  (title: Inline Registration Profile)</td>
</tr>
<tr>
    <td><CopyableCode code="quote_token" /></td>
    <td><code>string (uuid)</code></td>
    <td>A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122). (example: 7f3a2b1c-9d8e-4012-a5b6-c1d2e3f4a5b6) (wire: quoteToken)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The execution state of an asynchronous domain operation. CONFIRMED — operation has been accepted and is queued for execution. EXECUTING — operation is actively being processed by the registry or downstream systems. COMPLETED — operation finished successfully; result data is available. FAILED — operation terminated with an unrecoverable error; error detail is attached.  (title: Domain Operation Status)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: updatedAt)</td>
</tr>
</tbody>
</table>
</TabItem>
</Tabs>

## Methods

The following methods are available for this resource:

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Accessible by</th>
    <th>Required Params</th>
    <th>Optional Params</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-registration_id"><code>registration_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns a single registration record by its server-assigned registrationId, including the current execution status and the domain expiry date once the registration completes. This is the concrete poll endpoint for registration operations; the abstract equivalent is GET /operations/&#123;operationId&#125;.<br /></td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-idempotency_key"><code>idempotency_key</code></a>, <a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-quote_token"><code>quote_token</code></a>, <a href="#parameter-consent"><code>consent</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-isc_code"><code>isc_code</code></a></td>
    <td>Executes a previously quoted domain registration. **Irreversible once<br />accepted; creates a charge.** Requires a valid unexpired quoteToken from<br />`quoteDomainRegistration`, an `Idempotency-Key` header, and a consent<br />record. The target domain and period are in the request body alongside<br />the quoteToken.<br /><br />Before calling this endpoint, retrieve `requiredAgreements` from the<br />quote response and review each agreement before submitting the registration. Each agreement<br />includes a `title` (display label) and optional `url` (full legal text).<br />The `consent.agreementTypes` array must contain the `agreementType` value<br />from every item in `requiredAgreements`; a mismatch returns<br />`INVALID_AGREEMENT_KEYS`.<br /><br />Idempotency takes precedence over the single-use check: retrying with<br />the same `Idempotency-Key` replays the original operation even after<br />the token is consumed.<br /><br />Returns a `Registration` entity. Poll `links[rel=self]`<br />(`GET /registrations/&#123;registrationId&#125;`) until status is `COMPLETED` or<br />`FAILED`. The `operationId` field is also provided for clients that<br />prefer `GET /operations/&#123;operationId&#125;`; both resolve the same resource.<br /><br />Poll either until status is `COMPLETED` or `FAILED`. The operation is<br />fire-and-forget; always poll at least once even if the server completed<br />it synchronously.<br /><br />When `iscCode` was supplied at quote time, the same value must be<br />provided here or the request fails with `422 quote_mismatch`.<br />When `period` was supplied at quote time, the same value must be<br />provided here or the request fails with `422 quote_mismatch`.<br />When `profile` or `profileId` was supplied at quote time, the same<br />value must be provided here or the request fails with `422 quote_mismatch`.<br /><br />**PREMIUM domains:** when the quote's `fees` array is non-empty<br />(inventory `PREMIUM`), the execute request must include<br />`consent.acknowledgedFees` containing the same fees verbatim —<br />same types, amounts, and currencies. This confirms the customer<br />explicitly saw and accepted the specific charge before the<br />irreversible purchase is executed.<br /><br />- `acknowledgedFees` absent when fees exist → `422` with error<br />  name `consent_fees_required` (conditionally required by the quote; the<br />  constraint spans two requests and cannot be expressed in the<br />  schema).<br />- `acknowledgedFees` present but type or amount does not match<br />  the locked quote → `422` with error name `quote_mismatch`.<br /></td>
</tr>
</tbody>
</table>

## Parameters

Parameters can be passed in the `WHERE` clause of a query. Check the [Methods](#methods) section to see which parameters are required or optional for each operation.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr id="parameter-idempotency_key">
    <td><CopyableCode code="idempotency_key" /></td>
    <td><code>string</code></td>
    <td>Client-generated unique key (UUID recommended). Retrying a mutating request with the same Idempotency-Key returns the original response without creating a duplicate side effect. Required on all execute endpoints.  (example: 9f1c2e7a-4b3d-4e8f-a1c2-3d4e5f6a7b8c) (wire: Idempotency-Key)</td>
</tr>
<tr id="parameter-registration_id">
    <td><CopyableCode code="registration_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>Server-assigned registration identifier. (wire: registrationId)</td>
</tr>
<tr id="parameter-isc_code">
    <td><CopyableCode code="isc_code" /></td>
    <td><code>string</code></td>
    <td>ISC (International Shopper Code) for pricing context. When provided, prices reflect the applicable rates for this ISC.  (example: ISC_PARTNER_001) (wire: iscCode)</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header.  (wire: X-Request-Id)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

Returns a single registration record by its server-assigned registrationId, including the current execution status and the domain expiry date once the registration completes. This is the concrete poll endpoint for registration operations; the abstract equivalent is GET /operations/&#123;operationId&#125;.<br />

```sql
SELECT
operation_id,
profile_id,
registration_id,
consent,
created_at,
domain,
expires_at,
fees,
links,
period,
price,
profile,
quote_token,
status,
updated_at
FROM godaddy.registration.registrations_v3
WHERE registration_id = '{{ registration_id }}' -- required
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Executes a previously quoted domain registration. **Irreversible once<br />accepted; creates a charge.** Requires a valid unexpired quoteToken from<br />`quoteDomainRegistration`, an `Idempotency-Key` header, and a consent<br />record. The target domain and period are in the request body alongside<br />the quoteToken.<br /><br />Before calling this endpoint, retrieve `requiredAgreements` from the<br />quote response and review each agreement before submitting the registration. Each agreement<br />includes a `title` (display label) and optional `url` (full legal text).<br />The `consent.agreementTypes` array must contain the `agreementType` value<br />from every item in `requiredAgreements`; a mismatch returns<br />`INVALID_AGREEMENT_KEYS`.<br /><br />Idempotency takes precedence over the single-use check: retrying with<br />the same `Idempotency-Key` replays the original operation even after<br />the token is consumed.<br /><br />Returns a `Registration` entity. Poll `links[rel=self]`<br />(`GET /registrations/&#123;registrationId&#125;`) until status is `COMPLETED` or<br />`FAILED`. The `operationId` field is also provided for clients that<br />prefer `GET /operations/&#123;operationId&#125;`; both resolve the same resource.<br /><br />Poll either until status is `COMPLETED` or `FAILED`. The operation is<br />fire-and-forget; always poll at least once even if the server completed<br />it synchronously.<br /><br />When `iscCode` was supplied at quote time, the same value must be<br />provided here or the request fails with `422 quote_mismatch`.<br />When `period` was supplied at quote time, the same value must be<br />provided here or the request fails with `422 quote_mismatch`.<br />When `profile` or `profileId` was supplied at quote time, the same<br />value must be provided here or the request fails with `422 quote_mismatch`.<br /><br />**PREMIUM domains:** when the quote's `fees` array is non-empty<br />(inventory `PREMIUM`), the execute request must include<br />`consent.acknowledgedFees` containing the same fees verbatim —<br />same types, amounts, and currencies. This confirms the customer<br />explicitly saw and accepted the specific charge before the<br />irreversible purchase is executed.<br /><br />- `acknowledgedFees` absent when fees exist → `422` with error<br />  name `consent_fees_required` (conditionally required by the quote; the<br />  constraint spans two requests and cannot be expressed in the<br />  schema).<br />- `acknowledgedFees` present but type or amount does not match<br />  the locked quote → `422` with error name `quote_mismatch`.<br />

```sql
INSERT INTO godaddy.registration.registrations_v3 (
domain,
period,
profile_id,
profile,
quote_token,
consent,
idempotency_key,
x_request_id,
isc_code
)
SELECT 
'{{ domain }}' /* required */,
{{ period }},
'{{ profile_id }}',
'{{ profile }}',
'{{ quote_token }}' /* required */,
'{{ consent }}' /* required */,
'{{ idempotency_key }}',
'{{ x_request_id }}',
'{{ isc_code }}'
RETURNING
operation_id,
profile_id,
registration_id,
consent,
created_at,
domain,
expires_at,
fees,
links,
period,
price,
profile,
quote_token,
status,
updated_at
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: registrations_v3
  props:
    - name: idempotency_key
      value: "{{ idempotency_key }}"
      description: Required parameter for the registrations_v3 resource.
    - name: domain
      value: "{{ domain }}"
      description: |
        The domain name to register, in punycode A-label form for IDNs. Must match the domain in the quoteToken.
    - name: period
      value: {{ period }}
      description: |
        Registration period in years. Must match the period in the quote.
      default: 1
    - name: profile_id
      value: "{{ profile_id }}"
      description: |
        A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122).
    - name: profile
      description: |
        A one-time, non-persisted set of contacts and purchase preference defaults supplied inline on a quote or execute request. Use to provide registration data for this transaction without creating or updating a saved registration profile.
        Shared by the registration quote and execute request bodies. Every field is optional. Omitted fields account identity or other default values. Provided fields override only what is supplied — contact roles replace as a whole block; preference fields replace individually.
        This is not a saved registration profile and is not JSON Patch. Data here applies only to the current quote or registration request.
      value:
        contacts:
          registrant:
            firstName: "{{ firstName }}"
            lastName: "{{ lastName }}"
            organization: "{{ organization }}"
            email: "{{ email }}"
            phone:
              countryCode: "{{ countryCode }}"
              nationalNumber: "{{ nationalNumber }}"
              extensionNumber: "{{ extensionNumber }}"
            address:
              line1: "{{ line1 }}"
              line2: "{{ line2 }}"
              city: "{{ city }}"
              state: "{{ state }}"
              countryCode: "{{ countryCode }}"
              postalCode: "{{ postalCode }}"
          admin:
            firstName: "{{ firstName }}"
            lastName: "{{ lastName }}"
            organization: "{{ organization }}"
            email: "{{ email }}"
            phone:
              countryCode: "{{ countryCode }}"
              nationalNumber: "{{ nationalNumber }}"
              extensionNumber: "{{ extensionNumber }}"
            address:
              line1: "{{ line1 }}"
              line2: "{{ line2 }}"
              city: "{{ city }}"
              state: "{{ state }}"
              countryCode: "{{ countryCode }}"
              postalCode: "{{ postalCode }}"
          tech:
            firstName: "{{ firstName }}"
            lastName: "{{ lastName }}"
            organization: "{{ organization }}"
            email: "{{ email }}"
            phone:
              countryCode: "{{ countryCode }}"
              nationalNumber: "{{ nationalNumber }}"
              extensionNumber: "{{ extensionNumber }}"
            address:
              line1: "{{ line1 }}"
              line2: "{{ line2 }}"
              city: "{{ city }}"
              state: "{{ state }}"
              countryCode: "{{ countryCode }}"
              postalCode: "{{ postalCode }}"
          billing:
            firstName: "{{ firstName }}"
            lastName: "{{ lastName }}"
            organization: "{{ organization }}"
            email: "{{ email }}"
            phone:
              countryCode: "{{ countryCode }}"
              nationalNumber: "{{ nationalNumber }}"
              extensionNumber: "{{ extensionNumber }}"
            address:
              line1: "{{ line1 }}"
              line2: "{{ line2 }}"
              city: "{{ city }}"
              state: "{{ state }}"
              countryCode: "{{ countryCode }}"
              postalCode: "{{ postalCode }}"
        autoRenew: {{ autoRenew }}
        privacy: {{ privacy }}
        nameServers:
          - "{{ nameServers }}"
    - name: quote_token
      value: "{{ quote_token }}"
      description: |
        A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122).
    - name: consent
      description: |
        Customer consent record for a domain operation, capturing which legal agreements were accepted, which fees were acknowledged, when, and by whom. On execute, the caller supplies agreementTypes, agreedAt, and (when the quote carries fees) acknowledgedFees. The server derives agreedBy from the authenticated request context (OAuth identity, X-Shopper-Id, client IP, and transmission channel).
      value:
        agreementTypes:
          - "{{ agreementTypes }}"
        agreedAt: "{{ agreedAt }}"
        acknowledgedFees:
          - type: "{{ type }}"
            fee:
              currencyCode: "{{ currencyCode }}"
              value: {{ value }}
        agreedBy:
          type: "{{ type }}"
          principal: "{{ principal }}"
          actor: "{{ actor }}"
          ip: "{{ ip }}"
    - name: x_request_id
      value: "{{ x_request_id }}"
      description: Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header. 
      description: Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header. 
    - name: isc_code
      value: "{{ isc_code }}"
      description: ISC (International Shopper Code) for pricing context. When provided, prices reflect the applicable rates for this ISC.  (example: ISC_PARTNER_001)
      description: ISC (International Shopper Code) for pricing context. When provided, prices reflect the applicable rates for this ISC.  (example: ISC_PARTNER_001)
`}</CodeBlock>

</TabItem>
</Tabs>
