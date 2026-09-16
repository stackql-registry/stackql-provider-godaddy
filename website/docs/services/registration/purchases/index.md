--- 
title: purchases
hide_title: false
hide_table_of_contents: false
keywords:
  - purchases
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

GoDaddy Domains v1 API. Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="purchases" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.purchases" /></td></tr>
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
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-consent"><code>consent</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Registers the specified domain. Requires a consent object with agreement keys from GET /v1/domains/agreements. Charges the account's billing method.</td>
</tr>
<tr>
    <td><a href="#validate_contacts"><CopyableCode code="validate_contacts" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domains"><code>domains</code></a></td>
    <td><a href="#parameter-market_id"><code>market_id</code></a></td>
    <td>All contacts specified in request will be validated against all domains specified in "domains". As an alternative, you can also pass in tlds, with the exception of `uk`, which requires full domain names</td>
</tr>
<tr>
    <td><a href="#validate"><CopyableCode code="validate" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-consent"><code>consent</code></a></td>
    <td></td>
    <td>Validates a purchase request body against the TLD schema with no side effects and no charge. Returns 200 on success.</td>
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
<tr id="parameter-market_id">
    <td><CopyableCode code="market_id" /></td>
    <td><code>string (bcp-47)</code></td>
    <td>MarketId in which the request is being made, and for which responses should be localized</td>
</tr>
<tr id="parameter-x_shopper_id">
    <td><CopyableCode code="x_shopper_id" /></td>
    <td><code>string</code></td>
    <td>Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account. (wire: X-Shopper-Id)</td>
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

Registers the specified domain. Requires a consent object with agreement keys from GET /v1/domains/agreements. Charges the account's billing method.

```sql
INSERT INTO godaddy.registration.purchases (
consent,
contact_admin,
contact_billing,
contact_registrant,
contact_tech,
domain,
name_servers,
period,
privacy,
renew_auto,
x_shopper_id
)
SELECT 
'{{ consent }}' /* required */,
'{{ contact_admin }}',
'{{ contact_billing }}',
'{{ contact_registrant }}',
'{{ contact_tech }}',
'{{ domain }}' /* required */,
'{{ name_servers }}',
{{ period }},
{{ privacy }},
{{ renew_auto }},
'{{ x_shopper_id }}'
RETURNING
order_id,
currency,
item_count,
total
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: purchases
  props:
    - name: consent
      value:
        agreedAt: "{{ agreedAt }}"
        agreedBy: "{{ agreedBy }}"
        agreementKeys:
          - "{{ agreementKeys }}"
    - name: contact_admin
      value:
        addressMailing:
          address1: "{{ address1 }}"
          address2: "{{ address2 }}"
          city: "{{ city }}"
          country: "{{ country }}"
          postalCode: "{{ postalCode }}"
          state: "{{ state }}"
        email: "{{ email }}"
        fax: "{{ fax }}"
        jobTitle: "{{ jobTitle }}"
        nameFirst: "{{ nameFirst }}"
        nameLast: "{{ nameLast }}"
        nameMiddle: "{{ nameMiddle }}"
        organization: "{{ organization }}"
        phone: "{{ phone }}"
    - name: contact_billing
      value:
        addressMailing:
          address1: "{{ address1 }}"
          address2: "{{ address2 }}"
          city: "{{ city }}"
          country: "{{ country }}"
          postalCode: "{{ postalCode }}"
          state: "{{ state }}"
        email: "{{ email }}"
        fax: "{{ fax }}"
        jobTitle: "{{ jobTitle }}"
        nameFirst: "{{ nameFirst }}"
        nameLast: "{{ nameLast }}"
        nameMiddle: "{{ nameMiddle }}"
        organization: "{{ organization }}"
        phone: "{{ phone }}"
    - name: contact_registrant
      value:
        addressMailing:
          address1: "{{ address1 }}"
          address2: "{{ address2 }}"
          city: "{{ city }}"
          country: "{{ country }}"
          postalCode: "{{ postalCode }}"
          state: "{{ state }}"
        email: "{{ email }}"
        fax: "{{ fax }}"
        jobTitle: "{{ jobTitle }}"
        nameFirst: "{{ nameFirst }}"
        nameLast: "{{ nameLast }}"
        nameMiddle: "{{ nameMiddle }}"
        organization: "{{ organization }}"
        phone: "{{ phone }}"
    - name: contact_tech
      value:
        addressMailing:
          address1: "{{ address1 }}"
          address2: "{{ address2 }}"
          city: "{{ city }}"
          country: "{{ country }}"
          postalCode: "{{ postalCode }}"
          state: "{{ state }}"
        email: "{{ email }}"
        fax: "{{ fax }}"
        jobTitle: "{{ jobTitle }}"
        nameFirst: "{{ nameFirst }}"
        nameLast: "{{ nameLast }}"
        nameMiddle: "{{ nameMiddle }}"
        organization: "{{ organization }}"
        phone: "{{ phone }}"
    - name: domain
      value: "{{ domain }}"
      description: |
        For internationalized domain names with non-ascii characters, the domain name is converted to punycode before format and pattern validation rules are checked
    - name: name_servers
      value:
        - "{{ name_servers }}"
    - name: period
      value: {{ period }}
      default: 1
    - name: privacy
      value: {{ privacy }}
      default: false
    - name: renew_auto
      value: {{ renew_auto }}
      default: true
    - name: x_shopper_id
      value: "{{ x_shopper_id }}"
      description: Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account.
      description: Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account.
`}</CodeBlock>

</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="validate_contacts"
    values={[
        { label: 'validate_contacts', value: 'validate_contacts' },
        { label: 'validate', value: 'validate' }
    ]}
>
<TabItem value="validate_contacts">

All contacts specified in request will be validated against all domains specified in "domains". As an alternative, you can also pass in tlds, with the exception of `uk`, which requires full domain names

```sql
EXEC godaddy.registration.purchases.validate_contacts 
@market_id='{{ market_id }}', 
@contact_admin='{{ contact_admin }}', 
@contact_billing='{{ contact_billing }}', 
@contact_presence='{{ contact_presence }}', 
@contact_registrant='{{ contact_registrant }}', 
@contact_tech='{{ contact_tech }}', 
@domains='{{ domains }}', 
@entity_type='{{ entity_type }}'
;
```
</TabItem>
<TabItem value="validate">

Validates a purchase request body against the TLD schema with no side effects and no charge. Returns 200 on success.

```sql
EXEC godaddy.registration.purchases.validate 
@consent='{{ consent }}', 
@contact_admin='{{ contact_admin }}', 
@contact_billing='{{ contact_billing }}', 
@contact_registrant='{{ contact_registrant }}', 
@contact_tech='{{ contact_tech }}', 
@domain='{{ domain }}', 
@name_servers='{{ name_servers }}', 
@period='{{ period }}', 
@privacy='{{ privacy }}', 
@renew_auto='{{ renew_auto }}'
;
```
</TabItem>
</Tabs>
