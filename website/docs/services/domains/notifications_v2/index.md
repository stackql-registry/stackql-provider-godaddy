--- 
title: notifications_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - notifications_v2
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
<tr><td><b>Name</b></td><td><CopyableCode code="notifications_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.notifications_v2" /></td></tr>
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
    <td><CopyableCode code="notification_id" /></td>
    <td><code>string</code></td>
    <td>The notification ID to be used in POST /v2/customers/&#123;customerId&#125;/domains/notifications to acknowledge the notification (default: ) (wire: notificationId)</td>
</tr>
<tr>
    <td><CopyableCode code="request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier (via X-Request-Id header) indicating the request this notification is for (wire: requestId)</td>
</tr>
<tr>
    <td><CopyableCode code="added_at" /></td>
    <td><code>string (iso-datetime)</code></td>
    <td>The date the notification was added (default: ) (wire: addedAt)</td>
</tr>
<tr>
    <td><CopyableCode code="metadata" /></td>
    <td><code>string</code></td>
    <td>The notification data for the given type as specified by GET /v2/customers/&#123;customerId&#125;/domains/notifications/schema (opaque JSON object) (default: )</td>
</tr>
<tr>
    <td><CopyableCode code="resource" /></td>
    <td><code>string</code></td>
    <td>The resource the notification pertains to. (default: )</td>
</tr>
<tr>
    <td><CopyableCode code="resource_type" /></td>
    <td><code>string</code></td>
    <td>The type of resource the notification relates to (CONTACT, DOMAIN, HOST) (wire: resourceType)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The resulting status of the action. (AWAITING, CANCELLED, FAILED, PENDING, SUCCESS)</td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The type of action the notification relates to (AUTH_CODE_REGENERATE, AUTO_RENEWAL, CHANGE_OF_REGISTRANT_DELETE, DOMAIN_DELETE, DOMAIN_UPDATE, DOMAIN_UPDATE_NAME_SERVERS, PRIVACY_FORWARDING_UPDATE, REGISTER, TRANSFER, TRANSFER_IN, TRANSFER_IN_ACCEPT, TRANSFER_IN_CANCEL, TRANSFER_IN_RESTART, TRANSFER_IN_RETRY, TRANSFER_OUT, TRANSFER_OUT_ACCEPT, TRANSFER_OUT_REJECT)</td>
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
    <td><a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Returns the next unacknowledged domain notification. Returns 200 with a Notification body, or 204 if no notifications are pending.</td>
</tr>
<tr>
    <td><a href="#acknowledge"><CopyableCode code="acknowledge" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-notification_id"><code>notification_id</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Acknowledges a domain notification, removing it from the notification queue. Returns 204 No Content.</td>
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
<tr id="parameter-notification_id">
    <td><CopyableCode code="notification_id" /></td>
    <td><code>string</code></td>
    <td>The notification ID to acknowledge</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request.</td>
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

Returns the next unacknowledged domain notification. Returns 200 with a Notification body, or 204 if no notifications are pending.

```sql
SELECT
notification_id,
request_id,
added_at,
metadata,
resource,
resource_type,
status,
type
FROM godaddy.domains.notifications_v2
WHERE x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="acknowledge"
    values={[
        { label: 'acknowledge', value: 'acknowledge' }
    ]}
>
<TabItem value="acknowledge">

Acknowledges a domain notification, removing it from the notification queue. Returns 204 No Content.

```sql
EXEC godaddy.domains.notifications_v2.acknowledge 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@notification_id='{{ notification_id }}' --required, 
@x_request_id='{{ x_request_id }}'
;
```
</TabItem>
</Tabs>
