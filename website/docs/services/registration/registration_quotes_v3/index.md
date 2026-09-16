--- 
title: registration_quotes_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - registration_quotes_v3
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
<tr><td><b>Name</b></td><td><CopyableCode code="registration_quotes_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.registration_quotes_v3" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-isc_code"><code>isc_code</code></a></td>
    <td>Prices the registration, resolves contact and preference settings,<br />returns required legal agreements, and mints a single-use quoteToken<br />with a 10-minute TTL. Free and read-only; safe to call speculatively.<br /><br />When the domain is unavailable, `available: false` is returned with<br />no quoteToken — this is a valid non-error response.<br /><br />When required contact fields are missing, a `422` is returned with<br />field-level details so the agent can collect the missing data and re-quote.<br /><br />May pass `iscCode` to lock pricing at applicable rates;<br />the same value must be supplied on /registrations if provided here.<br />The `period` supplied here must be re-supplied on /registrations;<br />a mismatch returns `quote_mismatch`.<br />If `profile` or `profileId` is supplied here, the same value must be<br />re-supplied on /registrations; a mismatch returns `quote_mismatch`.<br /><br />**PREMIUM domains:** when the quoted domain has inventory `PREMIUM`,<br />the response includes a `fees` array containing a<br />`ONE_TIME_PREMIUM_DOMAIN_PURCHASE` entry. The execute request must<br />echo this array verbatim in `consent.acknowledgedFees` to confirm<br />the customer accepted the specific charge before the irreversible<br />purchase proceeds.<br /></td>
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

## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Prices the registration, resolves contact and preference settings,<br />returns required legal agreements, and mints a single-use quoteToken<br />with a 10-minute TTL. Free and read-only; safe to call speculatively.<br /><br />When the domain is unavailable, `available: false` is returned with<br />no quoteToken — this is a valid non-error response.<br /><br />When required contact fields are missing, a `422` is returned with<br />field-level details so the agent can collect the missing data and re-quote.<br /><br />May pass `iscCode` to lock pricing at applicable rates;<br />the same value must be supplied on /registrations if provided here.<br />The `period` supplied here must be re-supplied on /registrations;<br />a mismatch returns `quote_mismatch`.<br />If `profile` or `profileId` is supplied here, the same value must be<br />re-supplied on /registrations; a mismatch returns `quote_mismatch`.<br /><br />**PREMIUM domains:** when the quoted domain has inventory `PREMIUM`,<br />the response includes a `fees` array containing a<br />`ONE_TIME_PREMIUM_DOMAIN_PURCHASE` entry. The execute request must<br />echo this array verbatim in `consent.acknowledgedFees` to confirm<br />the customer accepted the specific charge before the irreversible<br />purchase proceeds.<br />

```sql
INSERT INTO godaddy.registration.registration_quotes_v3 (
domain,
period,
profile_id,
profile,
x_request_id,
isc_code
)
SELECT 
'{{ domain }}' /* required */,
{{ period }},
'{{ profile_id }}',
'{{ profile }}',
'{{ x_request_id }}',
'{{ isc_code }}'
RETURNING
available,
domain,
expires_at,
fees,
inventory,
irreversible,
period,
price,
quote_token,
renewal_price,
required_agreements,
resolved
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: registration_quotes_v3
  props:
    - name: domain
      value: "{{ domain }}"
      description: |
        The domain name to quote, in punycode A-label form.
    - name: period
      value: {{ period }}
      description: |
        Registration period in years. If supplied, the same value must be re-supplied on /registrations.
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
