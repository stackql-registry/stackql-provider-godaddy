--- 
title: records
hide_title: false
hide_table_of_contents: false
keywords:
  - records
  - dns
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
<tr><td><b>Name</b></td><td><CopyableCode code="records" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.dns.records" /></td></tr>
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
    <td><CopyableCode code="name" /></td>
    <td><code>string (domain)</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="data" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="port" /></td>
    <td><code>integer</code></td>
    <td>Service port (SRV only)</td>
</tr>
<tr>
    <td><CopyableCode code="priority" /></td>
    <td><code>integer (integer-positive)</code></td>
    <td>Record priority (MX and SRV only)</td>
</tr>
<tr>
    <td><CopyableCode code="protocol" /></td>
    <td><code>string</code></td>
    <td>Service protocol (SRV only)</td>
</tr>
<tr>
    <td><CopyableCode code="service" /></td>
    <td><code>string</code></td>
    <td>Service type (SRV only)</td>
</tr>
<tr>
    <td><CopyableCode code="ttl" /></td>
    <td><code>integer (integer-positive)</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td> (A, AAAA, CAA, CNAME, MX, NS, SOA, SRV, TXT)</td>
</tr>
<tr>
    <td><CopyableCode code="weight" /></td>
    <td><code>integer (integer-positive)</code></td>
    <td>Record weight (SRV only)</td>
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
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-name"><code>name</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a>, <a href="#parameter-offset"><code>offset</code></a>, <a href="#parameter-limit"><code>limit</code></a></td>
    <td>Returns DNS records for the domain. Optionally filter by record type and name. Returns an array of DNSRecord objects.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-name"><code>name</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Deletes all DNS records matching the specified type and name. All other records are preserved. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#add"><CopyableCode code="add" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-records"><code>records</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Appends DNS records to the domain's zone without removing existing records. Existing records with the same type and name are preserved. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#replace_all"><CopyableCode code="replace_all" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-records"><code>records</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Replaces the entire DNS record set for the domain. All existing records are removed and replaced with the submitted set. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#replace_by_type_name"><CopyableCode code="replace_by_type_name" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-name"><code>name</code></a>, <a href="#parameter-records"><code>records</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Replaces all DNS records of the specified type and name. All other records are preserved. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#replace_by_type"><CopyableCode code="replace_by_type" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-records"><code>records</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Replaces all DNS records of the specified type across all names. Records of other types are preserved. Returns 204 No Content.</td>
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
    <td>Domain whose DNS Records are to be replaced</td>
</tr>
<tr id="parameter-name">
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>DNS Record Name for which DNS Records are to be replaced</td>
</tr>
<tr id="parameter-type">
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>DNS Record Type for which DNS Records are to be replaced</td>
</tr>
<tr id="parameter-x_shopper_id">
    <td><CopyableCode code="x_shopper_id" /></td>
    <td><code>string</code></td>
    <td>Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account.</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of items to return</td>
</tr>
<tr id="parameter-offset">
    <td><CopyableCode code="offset" /></td>
    <td><code>integer</code></td>
    <td>Number of results to skip for pagination</td>
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

Returns DNS records for the domain. Optionally filter by record type and name. Returns an array of DNSRecord objects.

```sql
SELECT
name,
data,
port,
priority,
protocol,
service,
ttl,
type,
weight
FROM godaddy.dns.records
WHERE domain = '{{ domain }}' -- required
AND type = '{{ type }}' -- required
AND name = '{{ name }}' -- required
AND x_shopper_id = '{{ x_shopper_id }}'
AND offset = '{{ offset }}'
AND limit = '{{ limit }}'
;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete"
    values={[
        { label: 'delete', value: 'delete' }
    ]}
>
<TabItem value="delete">

Deletes all DNS records matching the specified type and name. All other records are preserved. Returns 204 No Content.

```sql
DELETE FROM godaddy.dns.records
WHERE domain = '{{ domain }}' --required
AND type = '{{ type }}' --required
AND name = '{{ name }}' --required
AND x_shopper_id = '{{ x_shopper_id }}'
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="add"
    values={[
        { label: 'add', value: 'add' },
        { label: 'replace_all', value: 'replace_all' },
        { label: 'replace_by_type_name', value: 'replace_by_type_name' },
        { label: 'replace_by_type', value: 'replace_by_type' }
    ]}
>
<TabItem value="add">

Appends DNS records to the domain's zone without removing existing records. Existing records with the same type and name are preserved. Returns 204 No Content.

```sql
EXEC godaddy.dns.records.add 
@domain='{{ domain }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@records='{{ records }}'
;
```
</TabItem>
<TabItem value="replace_all">

Replaces the entire DNS record set for the domain. All existing records are removed and replaced with the submitted set. Returns 204 No Content.

```sql
EXEC godaddy.dns.records.replace_all 
@domain='{{ domain }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@records='{{ records }}'
;
```
</TabItem>
<TabItem value="replace_by_type_name">

Replaces all DNS records of the specified type and name. All other records are preserved. Returns 204 No Content.

```sql
EXEC godaddy.dns.records.replace_by_type_name 
@domain='{{ domain }}' --required, 
@type='{{ type }}' --required, 
@name='{{ name }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@records='{{ records }}'
;
```
</TabItem>
<TabItem value="replace_by_type">

Replaces all DNS records of the specified type across all names. Records of other types are preserved. Returns 204 No Content.

```sql
EXEC godaddy.dns.records.replace_by_type 
@domain='{{ domain }}' --required, 
@type='{{ type }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@records='{{ records }}'
;
```
</TabItem>
</Tabs>
