--- 
title: registrations_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - registrations_v2
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

GoDaddy Domains v2 API, scoped to a customer: customer_id is resolved from the GODADDY_CUSTOMER_ID environment variable when set, otherwise it is a required parameter (a WHERE value always wins). Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="registrations_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.registrations_v2" /></td></tr>
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
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-consent"><code>consent</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Registers the specified domain. Requires a consent object with TLD agreement keys from the schema endpoint. Charges the account's billing method. Returns 202 - poll GET .../actions/REGISTER until the action reaches a terminal state.</td>
</tr>
<tr>
    <td><a href="#validate"><CopyableCode code="validate" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-consent"><code>consent</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Validates the registration request body against the TLD schema with no side effects and no charge. Returns 204 on success.</td>
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
<tr id="parameter-customer_id">
    <td><CopyableCode code="customer_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>GoDaddy customer identifier (UUID, not the numeric shopper number). Resolved from the <code>GODADDY_CUSTOMER_ID</code> environment variable when it is set (server variable, x-stackQL-envVar); otherwise required on every method of this resource. A WHERE value always takes precedence over the environment. API resellers acting on behalf of a subaccount pass the subaccount customer identifier.</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request.</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request. (wire: X-Request-Id)</td>
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

Registers the specified domain. Requires a consent object with TLD agreement keys from the schema endpoint. Charges the account's billing method. Returns 202 - poll GET .../actions/REGISTER until the action reaches a terminal state.

```sql
INSERT INTO godaddy.registration.registrations_v2 (
domain,
consent,
period,
name_servers,
renew_auto,
privacy,
contacts,
metadata,
x_request_id
)
SELECT 
'{{ domain }}' /* required */,
'{{ consent }}' /* required */,
{{ period }},
'{{ name_servers }}',
{{ renew_auto }},
{{ privacy }},
'{{ contacts }}',
'{{ metadata }}',
'{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: registrations_v2
  props:
    - name: domain
      value: "{{ domain }}"
      description: |
        For internationalized domain names with non-ascii characters, the domain name is converted to punycode before format and pattern validation rules are checked
    - name: consent
      value:
        agreementKeys:
          - "{{ agreementKeys }}"
        price: {{ price }}
        currency: "{{ currency }}"
        registryPremiumPricing: {{ registryPremiumPricing }}
        agreedBy: "{{ agreedBy }}"
        agreedAt: "{{ agreedAt }}"
        claimToken: "{{ claimToken }}"
    - name: period
      value: {{ period }}
      default: 1
    - name: name_servers
      value:
        - "{{ name_servers }}"
    - name: renew_auto
      value: {{ renew_auto }}
      default: true
    - name: privacy
      value: {{ privacy }}
      default: false
    - name: contacts
      value:
        admin:
          encoding: "{{ encoding }}"
          nameFirst: "{{ nameFirst }}"
          nameMiddle: "{{ nameMiddle }}"
          nameLast: "{{ nameLast }}"
          organization: "{{ organization }}"
          jobTitle: "{{ jobTitle }}"
          email: "{{ email }}"
          phone: "{{ phone }}"
          fax: "{{ fax }}"
          addressMailing:
            address1: "{{ address1 }}"
            address2: "{{ address2 }}"
            city: "{{ city }}"
            country: "{{ country }}"
            postalCode: "{{ postalCode }}"
            state: "{{ state }}"
          metadata: "{{ metadata }}"
        adminId: "{{ adminId }}"
        billing:
          encoding: "{{ encoding }}"
          nameFirst: "{{ nameFirst }}"
          nameMiddle: "{{ nameMiddle }}"
          nameLast: "{{ nameLast }}"
          organization: "{{ organization }}"
          jobTitle: "{{ jobTitle }}"
          email: "{{ email }}"
          phone: "{{ phone }}"
          fax: "{{ fax }}"
          addressMailing:
            address1: "{{ address1 }}"
            address2: "{{ address2 }}"
            city: "{{ city }}"
            country: "{{ country }}"
            postalCode: "{{ postalCode }}"
            state: "{{ state }}"
          metadata: "{{ metadata }}"
        billingId: "{{ billingId }}"
        registrant:
          encoding: "{{ encoding }}"
          nameFirst: "{{ nameFirst }}"
          nameMiddle: "{{ nameMiddle }}"
          nameLast: "{{ nameLast }}"
          organization: "{{ organization }}"
          jobTitle: "{{ jobTitle }}"
          email: "{{ email }}"
          phone: "{{ phone }}"
          fax: "{{ fax }}"
          addressMailing:
            address1: "{{ address1 }}"
            address2: "{{ address2 }}"
            city: "{{ city }}"
            country: "{{ country }}"
            postalCode: "{{ postalCode }}"
            state: "{{ state }}"
          metadata: "{{ metadata }}"
        registrantId: "{{ registrantId }}"
        tech:
          encoding: "{{ encoding }}"
          nameFirst: "{{ nameFirst }}"
          nameMiddle: "{{ nameMiddle }}"
          nameLast: "{{ nameLast }}"
          organization: "{{ organization }}"
          jobTitle: "{{ jobTitle }}"
          email: "{{ email }}"
          phone: "{{ phone }}"
          fax: "{{ fax }}"
          addressMailing:
            address1: "{{ address1 }}"
            address2: "{{ address2 }}"
            city: "{{ city }}"
            country: "{{ country }}"
            postalCode: "{{ postalCode }}"
            state: "{{ state }}"
          metadata: "{{ metadata }}"
        techId: "{{ techId }}"
    - name: metadata
      value: "{{ metadata }}"
      description: |
        The domain eligibility data fields as specified by GET /v2/customers/{customerId}/domains/register/schema/{tld} (opaque JSON object)
    - name: x_request_id
      value: "{{ x_request_id }}"
      description: A client provided identifier for tracking this request.
      description: A client provided identifier for tracking this request.
`}</CodeBlock>

</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="validate"
    values={[
        { label: 'validate', value: 'validate' }
    ]}
>
<TabItem value="validate">

Validates the registration request body against the TLD schema with no side effects and no charge. Returns 204 on success.

```sql
EXEC godaddy.registration.registrations_v2.validate 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@x_request_id='{{ x_request_id }}', 
@domain='{{ domain }}', 
@consent='{{ consent }}', 
@period='{{ period }}', 
@name_servers='{{ name_servers }}', 
@renew_auto='{{ renew_auto }}', 
@privacy='{{ privacy }}', 
@contacts='{{ contacts }}', 
@metadata='{{ metadata }}'
;
```
</TabItem>
</Tabs>
