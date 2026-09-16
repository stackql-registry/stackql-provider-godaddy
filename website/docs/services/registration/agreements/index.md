--- 
title: agreements
hide_title: false
hide_table_of_contents: false
keywords:
  - agreements
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
<tr><td><b>Name</b></td><td><CopyableCode code="agreements" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.agreements" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

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
    <td><CopyableCode code="agreement_key" /></td>
    <td><code>string</code></td>
    <td>Unique identifier for the legal agreement (wire: agreementKey)</td>
</tr>
<tr>
    <td><CopyableCode code="content" /></td>
    <td><code>string</code></td>
    <td>Contents of the legal agreement, suitable for embedding</td>
</tr>
<tr>
    <td><CopyableCode code="title" /></td>
    <td><code>string</code></td>
    <td>Title of the legal agreement</td>
</tr>
<tr>
    <td><CopyableCode code="url" /></td>
    <td><code>string (url)</code></td>
    <td>URL to a page containing the legal agreement</td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-tlds"><code>tlds</code></a>, <a href="#parameter-privacy"><code>privacy</code></a></td>
    <td><a href="#parameter-x_market_id"><code>x_market_id</code></a>, <a href="#parameter-for_transfer"><code>for_transfer</code></a></td>
    <td>Returns the TLD-specific legal agreements that must be accepted before purchase or transfer. The agreementKeys from this response are required in the consent object.</td>
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
<tr id="parameter-privacy">
    <td><CopyableCode code="privacy" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not privacy has been requested</td>
</tr>
<tr id="parameter-tlds">
    <td><CopyableCode code="tlds" /></td>
    <td><code>array</code></td>
    <td>list of TLDs whose legal agreements are to be retrieved</td>
</tr>
<tr id="parameter-for_transfer">
    <td><CopyableCode code="for_transfer" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not domain tranfer has been requested (wire: forTransfer)</td>
</tr>
<tr id="parameter-x_market_id">
    <td><CopyableCode code="x_market_id" /></td>
    <td><code>string (bcp-47)</code></td>
    <td>Unique identifier of the Market used to retrieve/translate Legal Agreements (wire: X-Market-Id)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

Returns the TLD-specific legal agreements that must be accepted before purchase or transfer. The agreementKeys from this response are required in the consent object.

```sql
SELECT
agreement_key,
content,
title,
url
FROM godaddy.registration.agreements
WHERE tlds = '{{ tlds }}' -- required
AND privacy = '{{ privacy }}' -- required
AND x_market_id = '{{ x_market_id }}'
AND for_transfer = '{{ for_transfer }}'
;
```
</TabItem>
</Tabs>
