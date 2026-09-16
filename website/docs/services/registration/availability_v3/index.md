--- 
title: availability_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - availability_v3
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
<tr><td><b>Name</b></td><td><CopyableCode code="availability_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.registration.availability_v3" /></td></tr>
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

Availability result for the requested domain.

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
    <td>Whether this domain appears to be available for registration. Best-effort; re-verified at quote time. Present only when the domain was successfully checked (no error). </td>
</tr>
<tr>
    <td><CopyableCode code="definitive" /></td>
    <td><code>boolean</code></td>
    <td>When true, the availability result was confirmed directly with the registry (ACCURACY mode). When false, the result is from a cached zone data check (SPEED mode) and may be stale. </td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain name checked, normalized to punycode A-label form.  (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="error" /></td>
    <td><code>object</code></td>
    <td>The error information. (title: Error)</td>
</tr>
<tr>
    <td><CopyableCode code="inventory" /></td>
    <td><code>string</code></td>
    <td>The inventory source for a domain name. REGISTRY — standard registry price inventory. REGISTRY_PREMIUM — registry premium tier pricing. PREMIUM — third-party premium domain marketplace.  (REGISTRY, REGISTRY_PREMIUM, PREMIUM) (title: Inventory Type, example: REGISTRY)</td>
</tr>
<tr>
    <td><CopyableCode code="prices" /></td>
    <td><code>array</code></td>
    <td>Multi-term pricing for this domain. Each entry represents a different registration period (e.g. 1 year, 2 years). Present when available is true. </td>
</tr>
<tr>
    <td><CopyableCode code="unicode_domain" /></td>
    <td><code>string</code></td>
    <td>The Unicode (U-label) form of the domain. Present only for IDN domains.  (example: münchen.de) (wire: unicodeDomain)</td>
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
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-optimize_for"><code>optimize_for</code></a>, <a href="#parameter-isc_code"><code>isc_code</code></a></td>
    <td>Returns an indicative availability result for one domain, including<br />per-term pricing when available. Availability is best-effort; the<br />authoritative check is performed at quote time. This operation does<br />not persist the check — there is no check identity or poll URL.<br /><br />A domain that cannot be checked is still returned as a `200` with an<br />`error` object on the body; request-level failures use the `4xx` responses.<br /></td>
</tr>
<tr>
    <td><a href="#check_bulk"><CopyableCode code="check_bulk" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domains"><code>domains</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Batch controller for domain availability checking. Accepts 1–25 domain<br />names alongside optional check criteria (optimization mode, ISC pricing<br />code). Returns one Availability result per requested domain in input<br />order inside `&#123; items: [...] &#125;`. Domains that cannot be checked carry<br />an `error` object on that item.<br /><br />For a single domain, GET /check-availability (getDomainAvailability)<br />offers the same check semantics and Availability result without a<br />request body; the response is the lone item unwrapped.<br /><br />Availability is best-effort indicative; the authoritative check is<br />always performed at quote time. This controller does not persist the<br />check — there is no check identity or poll URL.<br /></td>
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
    <td>The domain name to check, in punycode A-label form for IDNs. (example: example.com)</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header. </td>
</tr>
<tr id="parameter-isc_code">
    <td><CopyableCode code="isc_code" /></td>
    <td><code>string</code></td>
    <td>ISC (International Shopper Code) for pricing context. When provided, prices reflect the applicable rates for this ISC.  (example: ISC_PARTNER_001) (wire: iscCode)</td>
</tr>
<tr id="parameter-optimize_for">
    <td><CopyableCode code="optimize_for" /></td>
    <td><code>string</code></td>
    <td>Optional. When omitted, defaults to SPEED. Availability is always re-verified authoritatively at quote time regardless of this setting.  (example: SPEED) (wire: optimizeFor)</td>
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
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

Returns an indicative availability result for one domain, including<br />per-term pricing when available. Availability is best-effort; the<br />authoritative check is performed at quote time. This operation does<br />not persist the check — there is no check identity or poll URL.<br /><br />A domain that cannot be checked is still returned as a `200` with an<br />`error` object on the body; request-level failures use the `4xx` responses.<br />

```sql
SELECT
available,
definitive,
domain,
error,
inventory,
prices,
unicode_domain
FROM godaddy.registration.availability_v3
WHERE domain = '{{ domain }}' -- required
AND x_request_id = '{{ x_request_id }}'
AND optimize_for = '{{ optimize_for }}'
AND isc_code = '{{ isc_code }}'
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

Batch controller for domain availability checking. Accepts 1–25 domain<br />names alongside optional check criteria (optimization mode, ISC pricing<br />code). Returns one Availability result per requested domain in input<br />order inside `&#123; items: [...] &#125;`. Domains that cannot be checked carry<br />an `error` object on that item.<br /><br />For a single domain, GET /check-availability (getDomainAvailability)<br />offers the same check semantics and Availability result without a<br />request body; the response is the lone item unwrapped.<br /><br />Availability is best-effort indicative; the authoritative check is<br />always performed at quote time. This controller does not persist the<br />check — there is no check identity or poll URL.<br />

```sql
EXEC godaddy.registration.availability_v3.check_bulk 
@x_request_id='{{ x_request_id }}', 
@domains='{{ domains }}', 
@optimize_for='{{ optimize_for }}', 
@isc_code='{{ isc_code }}'
;
```
</TabItem>
</Tabs>
