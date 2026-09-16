--- 
title: domains_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - domains_v2
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
<tr><td><b>Name</b></td><td><CopyableCode code="domains_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.domains_v2" /></td></tr>
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
    <td><CopyableCode code="domain_id" /></td>
    <td><code>string</code></td>
    <td>Unique identifier for this Domain (wire: domainId)</td>
</tr>
<tr>
    <td><CopyableCode code="subaccount_id" /></td>
    <td><code>string</code></td>
    <td>Reseller subaccount shopperid who can manage the domain (wire: subaccountId)</td>
</tr>
<tr>
    <td><CopyableCode code="actions" /></td>
    <td><code>array</code></td>
    <td>List of current actions in progress for this domain</td>
</tr>
<tr>
    <td><CopyableCode code="auth_code" /></td>
    <td><code>string</code></td>
    <td>Authorization code for transferring the Domain (wire: authCode)</td>
</tr>
<tr>
    <td><CopyableCode code="contacts" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date and time when this domain was created (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="deleted_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date and time when this domain was deleted (wire: deletedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="dnssec_records" /></td>
    <td><code>array</code></td>
    <td>List of active DNSSEC records for this domain (wire: dnssecRecords)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string (domain)</code></td>
    <td>Name of the domain</td>
</tr>
<tr>
    <td><CopyableCode code="expiration_protected" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is protected from expiration (wire: expirationProtected)</td>
</tr>
<tr>
    <td><CopyableCode code="expires_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date and time when this domain will expire (wire: expiresAt)</td>
</tr>
<tr>
    <td><CopyableCode code="hold_registrar" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is on-hold by the registrar (wire: holdRegistrar)</td>
</tr>
<tr>
    <td><CopyableCode code="hostnames" /></td>
    <td><code>array</code></td>
    <td>Hostnames owned by the domain</td>
</tr>
<tr>
    <td><CopyableCode code="locked" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is locked to prevent transfers</td>
</tr>
<tr>
    <td><CopyableCode code="modified_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date and time when this domain was last modified (wire: modifiedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="name_servers" /></td>
    <td><code>array</code></td>
    <td>Fully-qualified domain names for DNS servers (wire: nameServers)</td>
</tr>
<tr>
    <td><CopyableCode code="privacy" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain has privacy protection</td>
</tr>
<tr>
    <td><CopyableCode code="registrar_created_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date and time when this domain was created by the registrar (wire: registrarCreatedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="registry_status_codes" /></td>
    <td><code>array</code></td>
    <td>The current registry status codes of the domain  - **ADD_PERIOD** — This grace period is provided after the initial registration of a domain name. - **AUTO_RENEW_PERIOD** — This grace period is provided after a domain name registration period expires and is extended (renewed) automatically by the registry. - **CLIENT_DELETE_PROHIBITED** — This status code tells your domain's registry to reject requests to delete the domain. - **CLIENT_HOLD** — This status code tells your domain's registry to not activate your domain in the DNS and as a consequence, it will not resolve. - **CLIENT_RENEW_PROHIBITED** — This status code tells your domain's registry to reject requests to renew your domain. - **CLIENT_TRANSFER_PROHIBITED** — This status code tells your domain's registry to reject requests to transfer the domain from your current registrar to another. - **CLIENT_UPDATE_PROHIBITED** — This status code tells your domain's registry to reject requests to update the domain. - **INACTIVE** — This status code indicates that delegation information (name servers) has not been associated with your domain. - **OK** — This is the standard status for a domain, meaning it has no pending operations or prohibitions. - **PENDING_CREATE** — This status code indicates that a request to create your domain has been received and is being processed. - **PENDING_DELETE** — This status code indicates that the domain is either in a redemption period if combined with either REDEMPTION_PERIOD or PENDING_RESTORE, if not combined with these, then indicates that the redemption period for the domain has ended and domain will be be purged and dropped from the registry database. - **PENDING_RENEW** — This status code indicates that a request to renew your domain has been received and is being processed. - **PENDING_RESTORE** — This status code indicates that your registrar has asked the registry to restore your domain that was in REDEMPTION_PERIOD status - **PENDING_TRANSFER** — This status code indicates that a request to transfer your domain to a new registrar has been received and is being processed. - **PENDING_UPDATE** — This status code indicates that a request to update your domain has been received and is being processed. - **REDEMPTION_PERIOD** — This status code indicates that your registrar has asked the registry to delete your domain. - **RENEW_PERIOD** — This grace period is provided after a domain name registration period is explicitly extended (renewed) by the registrar. - **SERVER_DELETE_PROHIBITED** — This status code prevents your domain from being deleted. - **SERVER_HOLD** — This status code is set by your domain's Registry Operator. Your domain is not activated in the DNS. - **SERVER_RENEW_PROHIBITED** — This status code indicates your domain's Registry Operator will not allow your registrar to renew your domain. - **SERVER_TRANSFER_PROHIBITED** — This status code prevents your domain from being transferred from your current registrar to another. - **SERVER_UPDATE_PROHIBITED** — This status code locks your domain preventing it from being updated. - **TRANSFER_PERIOD** — This grace period is provided after the successful transfer of a domain name from one registrar to another. (wire: registryStatusCodes)</td>
</tr>
<tr>
    <td><CopyableCode code="renew_auto" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is configured to automatically renew (wire: renewAuto)</td>
</tr>
<tr>
    <td><CopyableCode code="renew_deadline" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date the domain must renew on (wire: renewDeadline)</td>
</tr>
<tr>
    <td><CopyableCode code="renewal" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The current status of the domain  - **ACTIVE** — Domain has been registered and is active. - **CANCELLED** — Domain has been cancelled by the user or system, and is not reclaimable. - **DELETED_REDEEMABLE** — Domain is deleted but is redeemable. - **EXPIRED** — Domain has expired. - **FAILED** — Domain registration or transfer error. - **LOCKED_REGISTRAR** — Domain is locked at the registrar - this is usually the result of a spam, abuse, etc. - **PARKED** — Domain has been parked. - **HELD_REGISTRAR** — Domain is held at the registrar and cannot be transferred or modified - this is usually the result of a dispute. - **OWNERSHIP_CHANGED** — Domain has been moved to another account. - **PENDING_TRANSFER** — Domain transfer has been requested and is pending the transfer process. - **PENDING_REGISTRATION** — Domain is pending setup at the registry. - **REPOSSESSED** — Domain has been confiscated - this is usually the result of a chargeback, fraud, abuse, etc.). - **SUSPENDED** — Domain is in violation and has been suspended. - **TRANSFERRED** — Domain has been transferred to another registrar. (ACTIVE, CANCELLED, DELETED_REDEEMABLE, EXPIRED, FAILED, LOCKED_REGISTRAR, PARKED, HELD_REGISTRAR, OWNERSHIP_CHANGED, PENDING_TRANSFER, PENDING_REGISTRATION, REPOSSESSED, SUSPENDED, TRANSFERRED)</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_away_eligible_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Date and time when this domain is eligible to transfer (wire: transferAwayEligibleAt)</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_protected" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is protected from transfer (wire: transferProtected)</td>
</tr>
<tr>
    <td><CopyableCode code="verifications" /></td>
    <td><code>object</code></td>
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
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-includes"><code>includes</code></a></td>
    <td>Returns the full DomainDetailV2 object including status, contacts, nameservers, lock state, privacy flag, and expiration timestamp.</td>
</tr>
<tr>
    <td><a href="#update_nameservers"><CopyableCode code="update_nameservers" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Replaces the domain's authoritative nameservers. Returns 202 - poll GET .../actions/DOMAIN_UPDATE_NAME_SERVERS until the action reaches a terminal state.</td>
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
    <td>Domain whose name servers are to be replaced</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request.</td>
</tr>
<tr id="parameter-includes">
    <td><CopyableCode code="includes" /></td>
    <td><code>array</code></td>
    <td>Optional details to be included in the response</td>
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

Returns the full DomainDetailV2 object including status, contacts, nameservers, lock state, privacy flag, and expiration timestamp.

```sql
SELECT
domain_id,
subaccount_id,
actions,
auth_code,
contacts,
created_at,
deleted_at,
dnssec_records,
domain,
expiration_protected,
expires_at,
hold_registrar,
hostnames,
locked,
modified_at,
name_servers,
privacy,
registrar_created_at,
registry_status_codes,
renew_auto,
renew_deadline,
renewal,
status,
transfer_away_eligible_at,
transfer_protected,
verifications
FROM godaddy.domains.domains_v2
WHERE domain = '{{ domain }}' -- required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND x_request_id = '{{ x_request_id }}'
AND includes = '{{ includes }}'
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

Replaces the domain's authoritative nameservers. Returns 202 - poll GET .../actions/DOMAIN_UPDATE_NAME_SERVERS until the action reaches a terminal state.

```sql
EXEC godaddy.domains.domains_v2.update_nameservers 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}', 
@name_servers='{{ name_servers }}'
;
```
</TabItem>
</Tabs>
