--- 
title: suggestions_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - suggestions_v3
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
<tr><td><b>Name</b></td><td><CopyableCode code="suggestions_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.suggestions_v3" /></td></tr>
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

Suggested available domains sorted by relevance.

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
    <td>The suggested domain name in punycode A-label form.  (example: sunrisebakery.com)</td>
</tr>
<tr>
    <td><CopyableCode code="inventory" /></td>
    <td><code>string</code></td>
    <td>The inventory source for a domain name. REGISTRY — standard registry price inventory. REGISTRY_PREMIUM — registry premium tier pricing. PREMIUM — third-party premium domain marketplace.  (REGISTRY, REGISTRY_PREMIUM, PREMIUM) (title: Inventory Type, example: REGISTRY)</td>
</tr>
<tr>
    <td><CopyableCode code="prices" /></td>
    <td><code>array</code></td>
    <td>Multi-term pricing for this suggestion. Each entry represents a different registration period. Indicative only — the locked price is established at quote time. </td>
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
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-query"><code>query</code></a>, <a href="#parameter-tlds"><code>tlds</code></a>, <a href="#parameter-length_max"><code>length_max</code></a>, <a href="#parameter-length_min"><code>length_min</code></a>, <a href="#parameter-page_size"><code>page_size</code></a>, <a href="#parameter-sources"><code>sources</code></a></td>
    <td>Returns available domain name suggestions for a natural-language query<br />or keyword set. All results are available (available-only contract).<br />Prices are indicative; the authoritative price and availability check<br />is at quote time.<br /></td>
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
<tr id="parameter-length_max">
    <td><CopyableCode code="length_max" /></td>
    <td><code>integer</code></td>
    <td>Maximum length of second-level domain. (wire: lengthMax)</td>
</tr>
<tr id="parameter-length_min">
    <td><CopyableCode code="length_min" /></td>
    <td><code>integer</code></td>
    <td>Minimum length of second-level domain. (wire: lengthMin)</td>
</tr>
<tr id="parameter-page_size">
    <td><CopyableCode code="page_size" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of suggestions in the response. Defaults to 10 when omitted.  (wire: pageSize)</td>
</tr>
<tr id="parameter-query">
    <td><CopyableCode code="query" /></td>
    <td><code>string</code></td>
    <td>Natural-language query or keywords describing the desired domain, e.g. "sunrise bakery". Used to generate creative and keyword-spin suggestions.  (example: sunrise bakery)</td>
</tr>
<tr id="parameter-sources">
    <td><CopyableCode code="sources" /></td>
    <td><code>array</code></td>
    <td>Suggestion source strategies to activate.  (example: [EXTENSION, KEYWORD_SPIN])</td>
</tr>
<tr id="parameter-tlds">
    <td><CopyableCode code="tlds" /></td>
    <td><code>array</code></td>
    <td>Top-level domains to be included in suggestions. (example: [com, net, shop])</td>
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
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

Returns available domain name suggestions for a natural-language query<br />or keyword set. All results are available (available-only contract).<br />Prices are indicative; the authoritative price and availability check<br />is at quote time.<br />

```sql
SELECT
domain,
inventory,
prices
FROM godaddy.registration.suggestions_v3
WHERE x_request_id = '{{ x_request_id }}'
AND query = '{{ query }}'
AND tlds = '{{ tlds }}'
AND length_max = '{{ length_max }}'
AND length_min = '{{ length_min }}'
AND page_size = '{{ page_size }}'
AND sources = '{{ sources }}'
;
```
</TabItem>
</Tabs>
