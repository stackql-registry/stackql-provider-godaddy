--- 
title: api_usage_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - api_usage_v2
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

GoDaddy Domains v2 API (account-level, not customer-scoped). Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="api_usage_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.api_usage_v2" /></td></tr>
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
    <td><CopyableCode code="details" /></td>
    <td><code>array</code></td>
    <td>List of total request counts per endpoint.</td>
</tr>
<tr>
    <td><CopyableCode code="quota" /></td>
    <td><code>integer</code></td>
    <td>The total number of allowed requests in the month.  See https://developer.godaddy.com/getstarted for more information on api quotas and access limits.</td>
</tr>
<tr>
    <td><CopyableCode code="total" /></td>
    <td><code>integer</code></td>
    <td>The total number of requests in the month.</td>
</tr>
<tr>
    <td><CopyableCode code="yyyymm" /></td>
    <td><code>string</code></td>
    <td>The year/month timeframe for the request counts (in the format yyyy-mm)</td>
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
    <td><a href="#parameter-yyyymm"><code>yyyymm</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-includes"><code>includes</code></a></td>
    <td>Returns monthly API request counts for the account. Data is retained for three months.</td>
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
<tr id="parameter-yyyymm">
    <td><CopyableCode code="yyyymm" /></td>
    <td><code>string</code></td>
    <td>The year/month timeframe for the request counts (in the format yyyy-mm)</td>
</tr>
<tr id="parameter-includes">
    <td><CopyableCode code="includes" /></td>
    <td><code>array</code></td>
    <td>Determines if the detail records (grouped by request path) are included in the response</td>
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

Returns monthly API request counts for the account. Data is retained for three months.

```sql
SELECT
details,
quota,
total,
yyyymm
FROM godaddy.domains.api_usage_v2
WHERE yyyymm = '{{ yyyymm }}' -- required
AND x_request_id = '{{ x_request_id }}'
AND includes = '{{ includes }}'
;
```
</TabItem>
</Tabs>
