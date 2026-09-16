--- 
title: privacy_forwarding_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - privacy_forwarding_v2
  - domains
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
<tr><td><b>Name</b></td><td><CopyableCode code="privacy_forwarding_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.privacy_forwarding_v2" /></td></tr>
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

Request was successful

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
    <td><CopyableCode code="email_preference" /></td>
    <td><code>string</code></td>
    <td>The email forwarding preference for the domain  - **EMAIL_FILTER** — Filter for spam and forward email. - **EMAIL_SEND_ALL** — Forward all email. - **EMAIL_SEND_NONE** — Don't forward email. (EMAIL_FILTER, EMAIL_SEND_ALL, EMAIL_SEND_NONE) (wire: emailPreference)</td>
</tr>
<tr>
    <td><CopyableCode code="forwarding_email" /></td>
    <td><code>string</code></td>
    <td>The email that it forwards to (wire: forwardingEmail)</td>
</tr>
<tr>
    <td><CopyableCode code="private_email" /></td>
    <td><code>string</code></td>
    <td>The private email (wire: privateEmail)</td>
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
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns the current privacy email forwarding configuration including target address and forwarding mode.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-private_email_type"><code>private_email_type</code></a>, <a href="#parameter-email_preference"><code>email_preference</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Updates privacy email forwarding settings. Only fields included in the request are modified. Returns 202 - poll the actions endpoint for completion.</td>
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
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain name whose details are to be retrieved</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request. (wire: X-Request-Id)</td>
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

Returns the current privacy email forwarding configuration including target address and forwarding mode.

```sql
SELECT
email_preference,
forwarding_email,
private_email
FROM godaddy.domains.privacy_forwarding_v2
WHERE domain = '{{ domain }}' -- required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="update"
    values={[
        { label: 'update', value: 'update' }
    ]}
>
<TabItem value="update">

Updates privacy email forwarding settings. Only fields included in the request are modified. Returns 202 - poll the actions endpoint for completion.

```sql
UPDATE godaddy.domains.privacy_forwarding_v2
SET 
private_email_type = '{{ private_email_type }}',
forwarding_email = '{{ forwarding_email }}',
email_preference = '{{ email_preference }}'
WHERE 
domain = '{{ domain }}' --required
AND private_email_type = '{{ private_email_type }}' --required
AND email_preference = '{{ email_preference }}' --required
AND x_request_id = '{{ x_request_id}}';
```
</TabItem>
</Tabs>
