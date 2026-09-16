--- 
title: domains_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - domains_v3
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

GoDaddy Domains v3 API (Personal Access Token only). Mutations are asynchronous and return an operation to poll via domains.operations_v3.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="domains_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.domains_v3" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Domain found.

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
    <td><CopyableCode code="auto_renew" /></td>
    <td><code>boolean</code></td>
    <td>Whether the domain will be renewed automatically before expiration. (wire: autoRenew)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain name in punycode A-label form. (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="expires_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: expiresAt)</td>
</tr>
<tr>
    <td><CopyableCode code="idn_domain" /></td>
    <td><code>string</code></td>
    <td>The internationalized (U-label) representation of the domain name. Only present for internationalized domain names (IDNs).  (example: 例え.jp) (wire: idnDomain)</td>
</tr>
<tr>
    <td><CopyableCode code="links" /></td>
    <td><code>array</code></td>
    <td>HATEOAS links for domain sub-resources. rel=self — canonical URL for this domain resource. rel=nameservers — nameserver management sub-resource. rel=contacts — contact management sub-resource. rel=privacy — privacy toggle sub-resource. </td>
</tr>
<tr>
    <td><CopyableCode code="name_servers" /></td>
    <td><code>array</code></td>
    <td>Ordered list of authoritative nameserver hostnames for a domain. The first entry is primary; subsequent entries are secondaries. A minimum of two nameservers is required; the maximum is thirteen.  (title: Name Servers) (wire: nameServers)</td>
</tr>
<tr>
    <td><CopyableCode code="privacy" /></td>
    <td><code>boolean</code></td>
    <td>Whether WHOIS privacy protection is currently enabled on the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="renew_by" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: renewBy)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The lifecycle state of a registered domain. ACTIVE — domain is registered and resolving normally. EXPIRED — domain has passed its expiration date; renewal still possible during the grace period. CANCELLED — domain registration has been cancelled and released. CANCELLED_REDEEMABLE — cancelled domain still within the redemption grace period. PENDING_TRANSFER — inbound transfer from another registrar is in progress. TRANSFERRED_OUT — domain was transferred to another registrar. LOCKED — domain has a registry-level administrative lock applied.  (ACTIVE, EXPIRED, CANCELLED, CANCELLED_REDEEMABLE, PENDING_TRANSFER, TRANSFERRED_OUT, LOCKED) (title: Domain Status)</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_lock" /></td>
    <td><code>boolean</code></td>
    <td>Whether the registry transfer-lock (clientTransferProhibited) is engaged. When true, outbound transfers to another registrar are blocked at the registry.  (wire: transferLock)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: updatedAt)</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="list">

Paginated list of domains owned by the account.

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
    <td><CopyableCode code="auto_renew" /></td>
    <td><code>boolean</code></td>
    <td>Whether the domain will be renewed automatically before expiration. (wire: autoRenew)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain name in punycode A-label form. (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="expires_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: expiresAt)</td>
</tr>
<tr>
    <td><CopyableCode code="idn_domain" /></td>
    <td><code>string</code></td>
    <td>The internationalized (U-label) representation of the domain name. Only present for internationalized domain names (IDNs).  (example: 例え.jp) (wire: idnDomain)</td>
</tr>
<tr>
    <td><CopyableCode code="links" /></td>
    <td><code>array</code></td>
    <td>HATEOAS links for domain sub-resources. rel=self — canonical URL for this domain resource. rel=nameservers — nameserver management sub-resource. rel=contacts — contact management sub-resource. rel=privacy — privacy toggle sub-resource. </td>
</tr>
<tr>
    <td><CopyableCode code="name_servers" /></td>
    <td><code>array</code></td>
    <td>Ordered list of authoritative nameserver hostnames for a domain. The first entry is primary; subsequent entries are secondaries. A minimum of two nameservers is required; the maximum is thirteen.  (title: Name Servers) (wire: nameServers)</td>
</tr>
<tr>
    <td><CopyableCode code="privacy" /></td>
    <td><code>boolean</code></td>
    <td>Whether WHOIS privacy protection is currently enabled on the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="renew_by" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: renewBy)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The lifecycle state of a registered domain. ACTIVE — domain is registered and resolving normally. EXPIRED — domain has passed its expiration date; renewal still possible during the grace period. CANCELLED — domain registration has been cancelled and released. CANCELLED_REDEEMABLE — cancelled domain still within the redemption grace period. PENDING_TRANSFER — inbound transfer from another registrar is in progress. TRANSFERRED_OUT — domain was transferred to another registrar. LOCKED — domain has a registry-level administrative lock applied.  (ACTIVE, EXPIRED, CANCELLED, CANCELLED_REDEEMABLE, PENDING_TRANSFER, TRANSFERRED_OUT, LOCKED) (title: Domain Status)</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_lock" /></td>
    <td><code>boolean</code></td>
    <td>Whether the registry transfer-lock (clientTransferProhibited) is engaged. When true, outbound transfers to another registrar are blocked at the registry.  (wire: transferLock)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: updatedAt)</td>
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
    <td><a href="#parameter-domain_name"><code>domain_name</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns the management view of a single registered domain owned by the authenticated account, including status, nameservers, privacy and auto-renew preferences, and expiry date.<br /></td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-page_token"><code>page_token</code></a>, <a href="#parameter-page_token_direction"><code>page_token_direction</code></a>, <a href="#parameter-page_size"><code>page_size</code></a>, <a href="#parameter-statuses"><code>statuses</code></a>, <a href="#parameter-lifecycle_groups"><code>lifecycle_groups</code></a>, <a href="#parameter-updated_after"><code>updated_after</code></a>, <a href="#parameter-expires_before"><code>expires_before</code></a></td>
    <td>Returns a paginated collection of domain names owned by the authenticated account. Supports filtering by statuses and cursor-based pagination. The statuses and lifecycleGroups parameters are mutually exclusive; supplying both returns 400 Bad Request. An unrecognized value for statuses or lifecycleGroups returns 400 Bad Request.<br /></td>
</tr>
<tr>
    <td><a href="#update_nameservers"><CopyableCode code="update_nameservers" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain_name"><code>domain_name</code></a>, <a href="#parameter-idempotency_key"><code>idempotency_key</code></a>, <a href="#parameter-name_servers"><code>name_servers</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Replaces the authoritative nameservers for the domain with the provided list. Minimum 2, maximum 13. Returns a DomainOperation; propagation to the registry is asynchronous.<br /></td>
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
<tr id="parameter-idempotency_key">
    <td><CopyableCode code="idempotency_key" /></td>
    <td><code>string</code></td>
    <td>Client-generated unique key (UUID recommended). Retrying a mutating request with the same Idempotency-Key returns the original response without creating a duplicate side effect. Required on all execute endpoints.  (example: 9f1c2e7a-4b3d-4e8f-a1c2-3d4e5f6a7b8c)</td>
</tr>
<tr id="parameter-domain_name">
    <td><CopyableCode code="domain_name" /></td>
    <td><code>string</code></td>
    <td>The domain name in punycode A-label form (e.g., example.com). For IDNs, use the punycode representation.  (example: example.com)</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header. </td>
</tr>
<tr id="parameter-expires_before">
    <td><CopyableCode code="expires_before" /></td>
    <td><code>string (date-time)</code></td>
    <td>Return only domains whose registration expires before this timestamp (exclusive). Must be a valid RFC 3339 date-time.  (example: 2027-01-01T00:00:00Z) (wire: expiresBefore)</td>
</tr>
<tr id="parameter-lifecycle_groups">
    <td><CopyableCode code="lifecycle_groups" /></td>
    <td><code>array</code></td>
    <td>Filter results to domains belonging to one or more status groups. Supply multiple values as a single comma-separated list, e.g. `?lifecycleGroups=REGISTERED,PENDING`. Multiple values are combined with logical OR. Cannot be combined with the statuses parameter. Use this for coarse lifecycle phases that remain stable as new statuses are added; for precise filtering, use statuses.  (example: [REGISTERED, PENDING]) (wire: lifecycleGroups)</td>
</tr>
<tr id="parameter-page_size">
    <td><CopyableCode code="page_size" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of domains in the response. Defaults to 100 when omitted. Offset-based "page" parameter is not supported, only cursor-based "pageToken".  (wire: pageSize)</td>
</tr>
<tr id="parameter-page_token">
    <td><CopyableCode code="page_token" /></td>
    <td><code>string</code></td>
    <td>Opaque cursor from the links[rel=next or rel=prev] href of the previous page. When present, the response begins immediately after the item that produced the token. Omit to start from the beginning of the collection.  (example: eyJkb21haW4iOiJleGFtcGxlLmNvbSJ9) (wire: pageToken)</td>
</tr>
<tr id="parameter-page_token_direction">
    <td><CopyableCode code="page_token_direction" /></td>
    <td><code>string</code></td>
    <td>Optional token direction when `pageToken` is set; ignored otherwise.  (wire: pageTokenDirection)</td>
</tr>
<tr id="parameter-statuses">
    <td><CopyableCode code="statuses" /></td>
    <td><code>array</code></td>
    <td>Filter results to domains with one or more lifecycle statuses. Supply multiple values as a single comma-separated list, e.g. `?statuses=ACTIVE,EXPIRED`. Multiple values are combined with logical OR — returns domains matching ANY of the specified statuses. See DomainStatus for accepted values (ACTIVE, EXPIRED, PENDING_REGISTRATION, etc.). Cannot be combined with the lifecycleGroups parameter. Use this for precise filtering on specific known status values; for coarse lifecycle phases, consider lifecycleGroups.  (example: [ACTIVE, EXPIRED])</td>
</tr>
<tr id="parameter-updated_after">
    <td><CopyableCode code="updated_after" /></td>
    <td><code>string (date-time)</code></td>
    <td>Return only domains last updated after this timestamp (exclusive). Must be a valid RFC 3339 date-time.  (example: 2026-01-01T00:00:00Z) (wire: updatedAfter)</td>
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
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Returns the management view of a single registered domain owned by the authenticated account, including status, nameservers, privacy and auto-renew preferences, and expiry date.<br />

```sql
SELECT
auto_renew,
created_at,
domain,
expires_at,
idn_domain,
links,
name_servers,
privacy,
renew_by,
status,
transfer_lock,
updated_at
FROM godaddy.domains.domains_v3
WHERE domain_name = '{{ domain_name }}' -- required
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="list">

Returns a paginated collection of domain names owned by the authenticated account. Supports filtering by statuses and cursor-based pagination. The statuses and lifecycleGroups parameters are mutually exclusive; supplying both returns 400 Bad Request. An unrecognized value for statuses or lifecycleGroups returns 400 Bad Request.<br />

```sql
SELECT
auto_renew,
created_at,
domain,
expires_at,
idn_domain,
links,
name_servers,
privacy,
renew_by,
status,
transfer_lock,
updated_at
FROM godaddy.domains.domains_v3
WHERE x_request_id = '{{ x_request_id }}'
AND page_token = '{{ page_token }}'
AND page_token_direction = '{{ page_token_direction }}'
AND page_size = '{{ page_size }}'
AND statuses = '{{ statuses }}'
AND lifecycle_groups = '{{ lifecycle_groups }}'
AND updated_after = '{{ updated_after }}'
AND expires_before = '{{ expires_before }}'
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="update_nameservers"
    values={[
        { label: 'update_nameservers', value: 'update_nameservers' }
    ]}
>
<TabItem value="update_nameservers">

Replaces the authoritative nameservers for the domain with the provided list. Minimum 2, maximum 13. Returns a DomainOperation; propagation to the registry is asynchronous.<br />

```sql
EXEC godaddy.domains.domains_v3.update_nameservers 
@domain_name='{{ domain_name }}' --required, 
@idempotency_key='{{ idempotency_key }}' --required, 
@x_request_id='{{ x_request_id }}', 
@name_servers='{{ name_servers }}'
;
```
</TabItem>
</Tabs>
