--- 
title: availability
hide_title: false
hide_table_of_contents: false
keywords:
  - availability
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
<tr><td><b>Name</b></td><td><CopyableCode code="availability" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.availability" /></td></tr>
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
    <td><CopyableCode code="available" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain name is available</td>
</tr>
<tr>
    <td><CopyableCode code="currency" /></td>
    <td><code>string (iso-currency-code)</code></td>
    <td>Currency in which the `price` is listed. Only returned if tld is offered (default: USD)</td>
</tr>
<tr>
    <td><CopyableCode code="definitive" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the `available` answer has been definitively verified with the registry</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain name</td>
</tr>
<tr>
    <td><CopyableCode code="period" /></td>
    <td><code>integer (integer-positive)</code></td>
    <td>Number of years included in the price. Only returned if tld is offered</td>
</tr>
<tr>
    <td><CopyableCode code="price" /></td>
    <td><code>integer (currency-micro-unit)</code></td>
    <td>Price of the domain excluding taxes or fees. Only returned if tld is offered</td>
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
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td><a href="#parameter-check_type"><code>check_type</code></a>, <a href="#parameter-for_transfer"><code>for_transfer</code></a></td>
    <td>Checks whether a single domain is available to register and returns the current price in currency-micro-unit format. The definitive flag indicates whether the result came from a live registry query.</td>
</tr>
<tr>
    <td><a href="#check_bulk"><CopyableCode code="check_bulk" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domains"><code>domains</code></a></td>
    <td><a href="#parameter-check_type"><code>check_type</code></a></td>
    <td>Checks availability for multiple domains in a single request. Returns an array of availability and pricing results, one per domain queried.</td>
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
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain name whose availability is to be checked</td>
</tr>
<tr id="parameter-check_type">
    <td><CopyableCode code="check_type" /></td>
    <td><code>string</code></td>
    <td>Optimize for time ('FAST') or accuracy ('FULL')</td>
</tr>
<tr id="parameter-check_type">
    <td><CopyableCode code="check_type" /></td>
    <td><code>string</code></td>
    <td>Optimize for time ('FAST') or accuracy ('FULL') (wire: checkType)</td>
</tr>
<tr id="parameter-for_transfer">
    <td><CopyableCode code="for_transfer" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not to include domains available for transfer. If set to True, checkType is ignored (wire: forTransfer)</td>
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

Checks whether a single domain is available to register and returns the current price in currency-micro-unit format. The definitive flag indicates whether the result came from a live registry query.

```sql
SELECT
available,
currency,
definitive,
domain,
period,
price
FROM godaddy.registration.availability
WHERE domain = '{{ domain }}' -- required
AND check_type = '{{ check_type }}'
AND for_transfer = '{{ for_transfer }}'
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="check_bulk"
    values={[
        { label: 'check_bulk', value: 'check_bulk' }
    ]}
>
<TabItem value="check_bulk">

Checks availability for multiple domains in a single request. Returns an array of availability and pricing results, one per domain queried.

```sql
EXEC godaddy.registration.availability.check_bulk 
@check_type='{{ check_type }}', 
@domains='{{ domains }}'
;
```
</TabItem>
</Tabs>
