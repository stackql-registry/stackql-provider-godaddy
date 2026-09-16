--- 
title: registration_schemas_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - registration_schemas_v2
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
<tr><td><b>Name</b></td><td><CopyableCode code="registration_schemas_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.registration_schemas_v2" /></td></tr>
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
    <td><CopyableCode code="id" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="models" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="properties" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="required" /></td>
    <td><code>array</code></td>
    <td></td>
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
    <td><a href="#parameter-tld"><code>tld</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns the JSON schema for the registration request body for the specified TLD. Fetch before registering to identify required fields and TLD-specific constraints.</td>
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
<tr id="parameter-tld">
    <td><CopyableCode code="tld" /></td>
    <td><code>string</code></td>
    <td>The Top-Level Domain whose schema should be retrieved</td>
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

Returns the JSON schema for the registration request body for the specified TLD. Fetch before registering to identify required fields and TLD-specific constraints.

```sql
SELECT
id,
models,
properties,
required
FROM godaddy.registration.registration_schemas_v2
WHERE tld = '{{ tld }}' -- required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>
