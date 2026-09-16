--- 
title: suggestions
hide_title: false
hide_table_of_contents: false
keywords:
  - suggestions
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
<tr><td><b>Name</b></td><td><CopyableCode code="suggestions" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.suggestions" /></td></tr>
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
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Suggested domain name</td>
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
    <td></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a>, <a href="#parameter-query"><code>query</code></a>, <a href="#parameter-country"><code>country</code></a>, <a href="#parameter-city"><code>city</code></a>, <a href="#parameter-sources"><code>sources</code></a>, <a href="#parameter-tlds"><code>tlds</code></a>, <a href="#parameter-length_max"><code>length_max</code></a>, <a href="#parameter-length_min"><code>length_min</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-wait_ms"><code>wait_ms</code></a></td>
    <td>Returns domain name suggestions based on a seed domain, keywords, or purchase history. Useful for presenting alternatives when a desired domain is unavailable.</td>
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
<tr id="parameter-city">
    <td><CopyableCode code="city" /></td>
    <td><code>string (city-name)</code></td>
    <td>Name of city to be used as a hint for target region</td>
</tr>
<tr id="parameter-country">
    <td><CopyableCode code="country" /></td>
    <td><code>string (iso-country-code)</code></td>
    <td>Two-letter ISO country code to be used as a hint for target region NOTE: These are sample values, there are many more</td>
</tr>
<tr id="parameter-length_max">
    <td><CopyableCode code="length_max" /></td>
    <td><code>integer</code></td>
    <td>Maximum length of second-level domain (wire: lengthMax)</td>
</tr>
<tr id="parameter-length_min">
    <td><CopyableCode code="length_min" /></td>
    <td><code>integer</code></td>
    <td>Minimum length of second-level domain (wire: lengthMin)</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of suggestions to return</td>
</tr>
<tr id="parameter-query">
    <td><CopyableCode code="query" /></td>
    <td><code>string</code></td>
    <td>Domain name or set of keywords for which alternative domain names will be suggested</td>
</tr>
<tr id="parameter-sources">
    <td><CopyableCode code="sources" /></td>
    <td><code>array</code></td>
    <td>Sources to be queried - **CC_TLD** — Varies the TLD using Country Codes - **EXTENSION** — Varies the TLD - **KEYWORD_SPIN** — Identifies keywords and then rotates each one - **PREMIUM** — Includes variations with premium prices</td>
</tr>
<tr id="parameter-tlds">
    <td><CopyableCode code="tlds" /></td>
    <td><code>array</code></td>
    <td>Top-level domains to be included in suggestions NOTE: These are sample values, there are many more</td>
</tr>
<tr id="parameter-wait_ms">
    <td><CopyableCode code="wait_ms" /></td>
    <td><code>integer (integer-positive)</code></td>
    <td>Maximum amount of time, in milliseconds, to wait for responses If elapses, return the results compiled up to that point (wire: waitMs)</td>
</tr>
<tr id="parameter-x_shopper_id">
    <td><CopyableCode code="x_shopper_id" /></td>
    <td><code>string</code></td>
    <td>Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account. (wire: X-Shopper-Id)</td>
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

Returns domain name suggestions based on a seed domain, keywords, or purchase history. Useful for presenting alternatives when a desired domain is unavailable.

```sql
SELECT
domain
FROM godaddy.registration.suggestions
WHERE x_shopper_id = '{{ x_shopper_id }}'
AND query = '{{ query }}'
AND country = '{{ country }}'
AND city = '{{ city }}'
AND sources = '{{ sources }}'
AND tlds = '{{ tlds }}'
AND length_max = '{{ length_max }}'
AND length_min = '{{ length_min }}'
AND limit = '{{ limit }}'
AND wait_ms = '{{ wait_ms }}'
;
```
</TabItem>
</Tabs>
