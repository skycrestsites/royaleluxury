import { useState, type FormEvent } from 'react';
import { AdminShell, useAdmin } from '../components/AdminShell';
import { Badge, Button, Card, ErrorNotice, Field, Spinner, useToast } from '../components/ui';
import { callable } from '../lib/firebase';
import { membersQuery, pendingInvitesQuery, useLiveQuery } from '../lib/data';
import { date, errorMessage } from '../lib/format';
import type { AdminMember, InviteDoc, Role } from '../lib/types';

type InviteResult = { inviteId: string; link: string; emailSent: boolean; emailError: string | null };

export default function TeamPage() {
  return (
    <AdminShell title="Team" description="People who can sign in to this admin.">
      <Team />
    </AdminShell>
  );
}

function Team() {
  const { isOwner, user } = useAdmin();
  const notify = useToast();
  const members = useLiveQuery<AdminMember>(membersQuery);

  async function remove(member: AdminMember) {
    if (!window.confirm(`Remove ${member.email} from the team? They will be signed out right away.`)) return;
    try {
      await callable<{ uid: string }>('removeMember')({ uid: member.id });
      notify(`${member.email} was removed.`);
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
  }

  return (
    <div className="a-two-col">
      <Card title="Members">
        {members.loading ? (
          <Spinner />
        ) : (
          <>
            <ErrorNotice error={members.error} />
            <ul className="a-rows">
              {members.data.map((member) => (
                <li key={member.id} className="a-member">
                  <span className="a-avatar" aria-hidden="true">
                    {member.photoURL ? <img src={member.photoURL} alt="" referrerPolicy="no-referrer" /> : (member.displayName || member.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="a-stacked">
                    <strong>{member.displayName || member.email}</strong>
                    <span className="a-muted">
                      {member.email}
                      {member.createdAt && ` · joined ${date(member.createdAt)}`}
                    </span>
                  </span>
                  <span className="a-row-end">
                    <Badge value={member.role} />
                    {isOwner && member.id !== user.uid && (
                      <Button variant="ghost" onClick={() => remove(member)}>
                        Remove
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {isOwner ? (
        <div className="a-stack">
          <InviteForm />
          <PendingInvites />
        </div>
      ) : (
        <Card title="Invites">
          <p className="a-muted">Only owners can invite or remove team members.</p>
        </Card>
      )}
    </div>
  );
}

function InviteForm() {
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InviteResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const { data } = await callable<{ email: string; role: Role }, InviteResult>('inviteMember')({ email, role });
      setResult(data);
      setEmail('');
      notify(data.emailSent ? `Invite emailed to ${email}.` : 'Invite created. Email could not be sent, share the link below.', data.emailSent ? 'success' : 'error');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
    setBusy(false);
  }

  return (
    <Card title="Invite someone">
      <form className="a-form" onSubmit={onSubmit}>
        <Field label="Email">
          <input className="a-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Role" hint="Admins manage products, categories and orders. Owners can also manage the team.">
          <select className="a-input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </Field>
        <Button type="submit" busy={busy}>
          Send invite
        </Button>
      </form>
      {result && (
        <div className="a-invite-link">
          <p className="a-muted">
            {result.emailSent
              ? 'You can also share this link directly.'
              : `Email failed: ${(result.emailError ?? 'unknown error').replace(/\.+$/, '')}. Share this link directly.`} It works once and
            expires in 7 days.
          </p>
          <div className="a-copy">
            <input className="a-input a-mono" readOnly value={result.link} onFocus={(e) => e.target.select()} aria-label="Invite link" />
            <Button
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(result.link);
                notify('Link copied.');
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function PendingInvites() {
  const notify = useToast();
  const invites = useLiveQuery<InviteDoc>(pendingInvitesQuery);
  if (invites.loading || invites.data.length === 0) return null;

  async function revoke(invite: InviteDoc) {
    try {
      await callable<{ inviteId: string }>('revokeInvite')({ inviteId: invite.id });
      notify('Invite revoked.');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
  }

  return (
    <Card title="Pending invites">
      <ul className="a-rows">
        {invites.data.map((invite) => {
          const expired = invite.expiresAt ? invite.expiresAt.toMillis() < Date.now() : false;
          return (
            <li key={invite.id} className="a-member">
              <span className="a-stacked">
                <strong>{invite.email}</strong>
                <span className="a-muted">
                  {expired ? 'Expired' : `Expires ${date(invite.expiresAt)}`}
                  {invite.emailStatus === 'failed' && ' · email not delivered'}
                </span>
              </span>
              <span className="a-row-end">
                <Badge value={invite.role} />
                <Button variant="ghost" onClick={() => revoke(invite)}>
                  Revoke
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
