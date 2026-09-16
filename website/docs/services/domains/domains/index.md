--- 
title: domains
hide_title: false
hide_table_of_contents: false
keywords:
  - domains
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

GoDaddy Domains v1 API. Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="domains" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.domains" /></td></tr>
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
    <td><code>number (double)</code></td>
    <td>Unique identifier for this Domain (wire: domainId)</td>
</tr>
<tr>
    <td><CopyableCode code="subaccount_id" /></td>
    <td><code>string</code></td>
    <td>Reseller subaccount shopperid who can manage the domain (wire: subaccountId)</td>
</tr>
<tr>
    <td><CopyableCode code="auth_code" /></td>
    <td><code>string</code></td>
    <td>Authorization code for transferring the Domain (wire: authCode)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_admin" /></td>
    <td><code>object</code></td>
    <td> (wire: contactAdmin)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_billing" /></td>
    <td><code>object</code></td>
    <td> (wire: contactBilling)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_registrant" /></td>
    <td><code>object</code></td>
    <td> (wire: contactRegistrant)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_tech" /></td>
    <td><code>object</code></td>
    <td> (wire: contactTech)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain was created (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="deleted_at" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain was deleted (wire: deletedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Name of the domain</td>
</tr>
<tr>
    <td><CopyableCode code="expiration_protected" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is protected from expiration (wire: expirationProtected)</td>
</tr>
<tr>
    <td><CopyableCode code="expires" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain will expire</td>
</tr>
<tr>
    <td><CopyableCode code="expose_registrant_organization" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain registrant contact organization field should be shown in the WHOIS (wire: exposeRegistrantOrganization)</td>
</tr>
<tr>
    <td><CopyableCode code="expose_whois" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain contact details should be shown in the WHOIS (wire: exposeWhois)</td>
</tr>
<tr>
    <td><CopyableCode code="hold_registrar" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is on-hold by the registrar (wire: holdRegistrar)</td>
</tr>
<tr>
    <td><CopyableCode code="locked" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is locked to prevent transfers</td>
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
    <td><CopyableCode code="renew_auto" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is configured to automatically renew (wire: renewAuto)</td>
</tr>
<tr>
    <td><CopyableCode code="renew_deadline" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date the domain must renew on (wire: renewDeadline)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>Processing status of the domain - **ACTIVE** — All is well - **AWAITING*** — System is waiting for the end-user to complete an action - **CANCELLED*** — Domain has been cancelled, and may or may not be reclaimable - **CONFISCATED** — Domain has been confiscated, usually for abuse, chargeback, or fraud - **DISABLED*** — Domain has been disabled - **EXCLUDED*** — Domain has been excluded from Firehose registration - **EXPIRED*** — Domain has expired - **FAILED*** — Domain has failed a required action, and the system is no longer retrying - **HELD*** — Domain has been placed on hold, and likely requires intervention from Support - **LOCKED*** — Domain has been locked, and likely requires intervention from Support - **PARKED*** — Domain has been parked, and likely requires intervention from Support - **PENDING*** — Domain is working its way through an automated workflow - **RESERVED*** — Domain is reserved, and likely requires intervention from Support - **REVERTED** — Domain has been reverted, and likely requires intervention from Support - **SUSPENDED*** — Domain has been suspended, and likely requires intervention from Support - **TRANSFERRED*** — Domain has been transferred out - **UNKNOWN** — Domain is in an unknown state - **UNLOCKED*** — Domain has been unlocked, and likely requires intervention from Support - **UNPARKED*** — Domain has been unparked, and likely requires intervention from Support - **UPDATED*** — Domain ownership has been transferred to another account</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_away_eligible_at" /></td>
    <td><code>string (date-time)</code></td>
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
    <td><CopyableCode code="domain_id" /></td>
    <td><code>number (double)</code></td>
    <td>Unique identifier for this Domain (wire: domainId)</td>
</tr>
<tr>
    <td><CopyableCode code="auth_code" /></td>
    <td><code>string</code></td>
    <td>Authorization code for transferring the Domain (wire: authCode)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_admin" /></td>
    <td><code>object</code></td>
    <td> (wire: contactAdmin)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_billing" /></td>
    <td><code>object</code></td>
    <td> (wire: contactBilling)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_registrant" /></td>
    <td><code>object</code></td>
    <td> (wire: contactRegistrant)</td>
</tr>
<tr>
    <td><CopyableCode code="contact_tech" /></td>
    <td><code>object</code></td>
    <td> (wire: contactTech)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain was created (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="deleted_at" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain was deleted (wire: deletedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Name of the domain</td>
</tr>
<tr>
    <td><CopyableCode code="expiration_protected" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is protected from expiration (wire: expirationProtected)</td>
</tr>
<tr>
    <td><CopyableCode code="expires" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain will expire</td>
</tr>
<tr>
    <td><CopyableCode code="expose_whois" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain contact details should be shown in the WHOIS (wire: exposeWhois)</td>
</tr>
<tr>
    <td><CopyableCode code="hold_registrar" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is on-hold by the registrar (wire: holdRegistrar)</td>
</tr>
<tr>
    <td><CopyableCode code="locked" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is locked to prevent transfers</td>
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
    <td><CopyableCode code="renew_auto" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is configured to automatically renew (wire: renewAuto)</td>
</tr>
<tr>
    <td><CopyableCode code="renew_deadline" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date the domain must renew on (wire: renewDeadline)</td>
</tr>
<tr>
    <td><CopyableCode code="renewable" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is eligble for renewal based on status</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>Processing status of the domain - **ACTIVE** — All is well. - **AWAITING*** — System is waiting for the end-user to complete an action. - **CANCELLED*** — Domain has been cancelled, and may or may not be reclaimable. - **CONFISCATED** — Domain has been confiscated, usually for abuse, chargeback, or fraud. - **DISABLED*** — Domain has been disabled. - **EXCLUDED*** — Domain has been excluded from Firehose registration. - **EXPIRED*** — Domain has expired. - **FAILED*** — Domain has failed a required action, and the system is no longer retrying. - **HELD*** — Domain has been placed on hold, and likely requires intervention from Support. - **LOCKED*** — Domain has been locked, and likely requires intervention from Support. - **PARKED*** — Domain has been parked, and likely requires intervention from Support. - **PENDING*** — Domain is working its way through an automated workflow. - **RESERVED*** — Domain is reserved, and likely requires intervention from Support. - **REVERTED** — Domain has been reverted, and likely requires intervention from Support. - **SUSPENDED*** — Domain has been suspended, and likely requires intervention from Support. - **TRANSFERRED*** — Domain has been transferred out. - **UNKNOWN** — Domain is in an unknown state. - **UNLOCKED*** — Domain has been unlocked, and likely requires intervention from Support. - **UNPARKED*** — Domain has been unparked, and likely requires intervention from Support. - **UPDATED*** — Domain ownership has been transferred to another account.</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_away_eligible_at" /></td>
    <td><code>string (date-time)</code></td>
    <td>Date and time when this domain is eligible to transfer (wire: transferAwayEligibleAt)</td>
</tr>
<tr>
    <td><CopyableCode code="transfer_protected" /></td>
    <td><code>boolean</code></td>
    <td>Whether or not the domain is protected from transfer (wire: transferProtected)</td>
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
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Returns the full DomainDetail object including status, contacts, nameservers, lock state, privacy flag, and expiration timestamp.</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a>, <a href="#parameter-statuses"><code>statuses</code></a>, <a href="#parameter-status_groups"><code>status_groups</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-marker"><code>marker</code></a>, <a href="#parameter-includes"><code>includes</code></a>, <a href="#parameter-modified_date"><code>modified_date</code></a></td>
    <td>Returns a paginated list of domains owned by the authenticated account. Supports filtering by status and optional inclusion of contacts, nameservers, and authCode in each record.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Updates one or more fields on the domain. Accepts a partial DomainUpdate body - only fields included are modified. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#cancel"><CopyableCode code="cancel" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Cancels a purchased domain and initiates a refund if within the cancellation window. This action is irreversible.</td>
</tr>
<tr>
    <td><a href="#update_contacts"><CopyableCode code="update_contacts" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-contact_registrant"><code>contact_registrant</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Updates domain settings. Only fields included in the request body are modified. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#renew"><CopyableCode code="renew" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Renews the domain for the specified period, extending the expiration date. Charges the account's billing method.</td>
</tr>
<tr>
    <td><a href="#verify_registrant_email"><CopyableCode code="verify_registrant_email" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Re-sends the ICANN registrant email verification to the domain's registrant contact. Use when the original verification email was not received or has expired.</td>
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
    <td>Domain whose Contact E-mail should be verified.</td>
</tr>
<tr id="parameter-x_shopper_id">
    <td><CopyableCode code="x_shopper_id" /></td>
    <td><code>string</code></td>
    <td>Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account.</td>
</tr>
<tr id="parameter-includes">
    <td><CopyableCode code="includes" /></td>
    <td><code>array</code></td>
    <td>Optional details to be included in the response</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of domains to return</td>
</tr>
<tr id="parameter-marker">
    <td><CopyableCode code="marker" /></td>
    <td><code>string</code></td>
    <td>Marker Domain to use as the offset in results</td>
</tr>
<tr id="parameter-modified_date">
    <td><CopyableCode code="modified_date" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>Only include results that have been modified since the specified date (wire: modifiedDate)</td>
</tr>
<tr id="parameter-status_groups">
    <td><CopyableCode code="status_groups" /></td>
    <td><code>array</code></td>
    <td>Only include results with `status` value in any of the specified groups (wire: statusGroups)</td>
</tr>
<tr id="parameter-statuses">
    <td><CopyableCode code="statuses" /></td>
    <td><code>array</code></td>
    <td>Only include results with `status` value in the specified set</td>
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
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Returns the full DomainDetail object including status, contacts, nameservers, lock state, privacy flag, and expiration timestamp.

```sql
SELECT
domain_id,
subaccount_id,
auth_code,
contact_admin,
contact_billing,
contact_registrant,
contact_tech,
created_at,
deleted_at,
domain,
expiration_protected,
expires,
expose_registrant_organization,
expose_whois,
hold_registrar,
locked,
name_servers,
privacy,
registrar_created_at,
renew_auto,
renew_deadline,
status,
transfer_away_eligible_at,
transfer_protected,
verifications
FROM godaddy.domains.domains
WHERE domain = '{{ domain }}' -- required
AND x_shopper_id = '{{ x_shopper_id }}'
;
```
</TabItem>
<TabItem value="list">

Returns a paginated list of domains owned by the authenticated account. Supports filtering by status and optional inclusion of contacts, nameservers, and authCode in each record.

```sql
SELECT
domain_id,
auth_code,
contact_admin,
contact_billing,
contact_registrant,
contact_tech,
created_at,
deleted_at,
domain,
expiration_protected,
expires,
expose_whois,
hold_registrar,
locked,
name_servers,
privacy,
registrar_created_at,
renew_auto,
renew_deadline,
renewable,
status,
transfer_away_eligible_at,
transfer_protected
FROM godaddy.domains.domains
WHERE x_shopper_id = '{{ x_shopper_id }}'
AND statuses = '{{ statuses }}'
AND status_groups = '{{ status_groups }}'
AND limit = '{{ limit }}'
AND marker = '{{ marker }}'
AND includes = '{{ includes }}'
AND modified_date = '{{ modified_date }}'
;
```
</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="update"
    values={[
        { label: 'update', value: 'update' }
    ]}
>
<TabItem value="update">

Updates one or more fields on the domain. Accepts a partial DomainUpdate body - only fields included are modified. Returns 204 No Content.

```sql
UPDATE godaddy.domains.domains
SET 
locked = {{ locked }},
name_servers = '{{ name_servers }}',
renew_auto = {{ renew_auto }},
subaccount_id = '{{ subaccount_id }}',
expose_registrant_organization = {{ expose_registrant_organization }},
expose_whois = {{ expose_whois }},
consent = '{{ consent }}'
WHERE 
domain = '{{ domain }}' --required
AND x_shopper_id = '{{ x_shopper_id}}';
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="cancel"
    values={[
        { label: 'cancel', value: 'cancel' }
    ]}
>
<TabItem value="cancel">

Cancels a purchased domain and initiates a refund if within the cancellation window. This action is irreversible.

```sql
DELETE FROM godaddy.domains.domains
WHERE domain = '{{ domain }}' --required
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="update_contacts"
    values={[
        { label: 'update_contacts', value: 'update_contacts' },
        { label: 'renew', value: 'renew' },
        { label: 'verify_registrant_email', value: 'verify_registrant_email' }
    ]}
>
<TabItem value="update_contacts">

Updates domain settings. Only fields included in the request body are modified. Returns 204 No Content.

```sql
EXEC godaddy.domains.domains.update_contacts 
@domain='{{ domain }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@contact_admin='{{ contact_admin }}', 
@contact_billing='{{ contact_billing }}', 
@contact_registrant='{{ contact_registrant }}', 
@contact_tech='{{ contact_tech }}'
;
```
</TabItem>
<TabItem value="renew">

Renews the domain for the specified period, extending the expiration date. Charges the account's billing method.

```sql
EXEC godaddy.domains.domains.renew 
@domain='{{ domain }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@period='{{ period }}'
;
```
</TabItem>
<TabItem value="verify_registrant_email">

Re-sends the ICANN registrant email verification to the domain's registrant contact. Use when the original verification email was not received or has expired.

```sql
EXEC godaddy.domains.domains.verify_registrant_email 
@domain='{{ domain }}' --required, 
@x_shopper_id='{{ x_shopper_id }}'
;
```
</TabItem>
</Tabs>
