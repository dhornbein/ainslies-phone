## Critical Issues

- **`ansible/playbooks/full-setup.yml`: fatal dependency on a broken sub-playbook.** The full automation pipeline unconditionally imports `ht801-autoprovision.yml`, which is marked "DANGER THIS DOESN'T WORK". Because that sub-playbook still contains hard failures (see below), `ansible-playbook playbooks/full-setup.yml` can never complete. Outcome: the advertised end-to-end provisioning run bombs out before the dialplan or HT801 verification steps finish.
- **`ansible/playbooks/ht801-autoprovision.yml`: multiple blockers stop execution.** The playbook sets `ht801_logged_in` to the raw `uri` result object, so every subsequent task runs even when login returns HTTP 401/403; more seriously, the "Change HT801 Admin Password" task references an undefined `ht801_login_default` variable, which triggers an `UndefinedError` and aborts the run. Until those conditions are fixed, any automation attempt against the ATA will fail mid-flight and leave the device unconfigured.
- **`ansible/group_vars/all.yml`: hard-coded HT801 admin password committed to source.** Shipping the credential (`Phone2Pi`) in plain text is a high-risk security exposure—anyone with repo access can log into deployed hardware. The value needs to move into Ansible Vault (or another secrets store) before pushing this repository outside a trusted environment.
  - Action: we are not needing to harden this, there is extremely low risk of attack, we can leave it as is for now.
- **Feature F204: small recording cleanup logic is incomplete.** The current implementation in `extensions.conf.j2` only deletes recordings that are too small (< 30KB) at recording time, but doesn't implement the advertised "F204: Removes memo recordings that are very small" feature that should clean up existing small recordings from previous sessions.
  - Action: seems like the cleanup is not necessary because small recordings are not saved, so we can remove this feature from the docs.

## Documentation Review

- **`ansible/README.md`: overstates HT801 automation maturity.** The guide markets `ht801-autoprovision.yml` and `full-setup.yml` as “✨ NEW” turnkey flows that auto-configure the ATA end to end, yet the playbook itself is labelled `# DANGER THIS DOESN'T WORK` and still fatally aborts on undefined variables. The README needs to warn that HT801 automation is experimental (or disabled entirely) until the playbook is fixed.
  - Action: change all documentation to indicate this as a work in progress, remove it from the playbook until it is functional. Update the documentation to reference the setup guide.
- **`.ai/features.md`: conflicting deployment status.** Feature F602 claims the “Complete end-to-end automation orchestration” via `full-setup.yml` is working, while the command list shows every step succeeding—including the broken `ht801-autoprovision.yml`. Likewise F605 is marked ❌ but its capability bullets all read “(working)”. These sections should be rewritten to reflect the current failure modes and outstanding work.
  - Action: update the documentation to reflect the current status of the automation, and remove the broken playbook from the end-to-end flow.
- **`.ai/deploy.md`: incorrect deployment targets and scope.** The guide states updates sync to `~/ainslie-phone-live`, but `group_vars/all.yml` sets `deploy_path` to `~/ainslie-phone` and no playbook ever creates an `*-live` directory. It also calls “Deploy code updates” even though `playbooks/update.yml` only runs audio conversion/sync plus dialplan templates—the rest of the project tree is never copied. The text should clarify what actually changes and where the files land.
  - Action: update the documentation to reflect the actual deployment process, we no longer use ~/ainslie-phone* for anything. Sounds are rsynced directly to the asterisk sounds directory.
- **`.ai/spec.md`: status mismatched with implementation.** The specification reiterates that the “Deployment: Ansible automation pipeline” is fully operational, which contradicts the broken full automation flow. Update the status matrix to mark HT801 auto-provisioning (and any dependent milestones) as incomplete.
  - Action: update this doc, follow the same guidance as above. Features.md should be the most up to date.
- **Key management doc drift.** Multiple docs (e.g., `.ai/deploy.md`) reference the SSH key path `~/.ssh/ainslie_phone_pi`, but `group_vars/all.yml` actually expects `~/.ssh/id_pi5_ainsile_phone`. The mismatch will trip up new operators following the written instructions.
- Action: let's simplify our docs, remove deploy if possible and combine it with ansible/README.md. Update all references to the correct SSH key path. Move over, update all docs to reflect the reality of the code.

## Code Quality and Refactoring Suggestions

- **Harden and simplify HT801 login flow.** In `ht801-autoprovision.yml`, set `ht801_logged_in` to a boolean (e.g., `{{ ht801_login.status in [200, 302] }}`) and gate follow-on tasks behind that flag so the playbook short-circuits cleanly when authentication fails. While touching that block, rename the undefined `ht801_login_default` condition to reference the actual login result and wrap the password-change block in a `block/rescue` so bad credentials don’t abort the whole run.
- **Make full automation opt-in until stable.** Adjust `full-setup.yml` so the final `import_playbook: ht801-autoprovision.yml` only runs when a tag or `--extra-vars enable_ht801_autoprovision=true` is set. That keeps the broader provisioning flow usable while HT801 automation is still under construction.
- **Replace bulk `copy` with targeted sync.** `provision.yml` currently copies the entire repo (including `.git`, `.ai`, raw source audio, etc.) to the Pi with `ansible.builtin.copy`. Switching to `ansible.posix.synchronize` (with explicit include/exclude lists) or reusing the audio/config deploy logic would cut deploy time and avoid leaking development-only artifacts.
  - Action: assess if this is necessary, remove it if not. We deploy sound files via rsync. However, we do want to setup the home directory, here's the current setup:
  ```
  lrwxrwxrwx 1 drew drew   13 Sep 17 00:09 asterisk -> /etc/asterisk
  lrwxrwxrwx 1 drew drew   24 Sep 17 00:15 extensions.conf -> asterisk/extensions.conf
  lrwxrwxrwx 1 drew drew   19 Sep 17 00:16 pjsip.conf -> asterisk/pjsip.conf
  -rwxr-xr-x 1 drew drew   98 Sep 27 13:56 random_ring.sh
  -rwxr-xr-x 1 drew drew  550 Sep 26 14:09 recovery_script.sh
  lrwxrwxrwx 1 drew drew   24 Sep 17 21:46 sounds -> /var/lib/asterisk/sounds
  -rwxr-xr-x 1 drew drew 1107 Sep 26 13:02 status.sh
  ```
  create these files and symlinks as part of the setup. Have all scripts as templates.
- **Align `update.yml` with its status message.** The playbook’s final debug message references `deploy_path`, but no task actually syncs code there. Either sync the templated files/directories to `deploy_path` or rewrite the message so expectations match reality.
  - action: remove deploy_path entirely, we don't use it for anything.
- **Consolidate HT801 credential variables.** Right now `group_vars/all.yml` and `ht801-autoprovision.yml` each define `ht801_admin_password`/`ht801_new_password`. Source the password from a single variable (ideally vaulted) to prevent drift and simplify future rotations.
  - Action: ignore for now
- **Fix undefined variable references in dialplan.** The `extensions.conf.j2` template references variables like `TONE_GENTAL` (should be "GENTLE") that contain typos, potentially causing confusion or runtime issues.
  - Action: This should be TONE-UP and the other should be TONE-DOWN. so overwrite the typos.
- **Improve command injection safety.** Replace unsafe `System()` calls in dialplan with Asterisk's built-in file manipulation functions where possible, or add input validation to ensure `MEMO_CODE` contains only safe characters.
  - **Research findings**: System() application is legitimate in Asterisk 18. TrySystem() also available. No direct built-in file deletion functions found in Asterisk dialplan applications. AGI/EAGI could provide safer file operations via controlled scripts.
  - **Current usage**: `extensions.conf.j2` uses `System(rm -f /var/lib/asterisk/sounds/recordings/${MEMO_CODE}.wav)` in 3 locations (lines 257, 295, 360)
  - **Security assessment**: MEMO_CODE comes from internal dialplan logic, risk may be acceptable
  - **Recommended improvements**: Add input validation to ensure MEMO_CODE contains only safe characters (alphanumeric, underscore, hyphen), or replace with AGI script
  - Action: leave this as is for now, but evaluate if there are actually built-in functions that can do this. Add your findings to the review.

## Best Practices and Recommendations

- **Move credentials into Ansible Vault.** Secrets like `ht801_admin_password` (and any future SIP auth tokens) are checked into git via `group_vars/all.yml`. Vaulting them—or sourcing from environment/inventory vars—eliminates the biggest security liability in the current automation.
  - Action: we are not needing to harden this, there is extremely low risk of attack, we can leave it as is for now.
- **Re-enable host key verification after bootstrap.** `ansible.cfg` disables host key checking and writes keys to `/dev/null`. That shortcut is handy during development, but production runs should turn host key checking back on (or pin the Pi’s fingerprint in `known_hosts`) to prevent MITM surprises.
  - Action: we can ignore this for now, but it is a good idea to re-enable it once we are done developing.
- **Add automation linting to CI.** Running `ansible-lint` and `yamllint` (locally or in CI) would catch mis-scoped variables like `ht801_login_default` before they land in main, and keep playbooks consistent as the system grows.
- **Codify test hooks for the dialplan.** Consider a lightweight verification script (e.g., `asterisk -rx "dialplan show from-phone" | grep ...`) or a `sipp` scenario run after `update.yml` so dialplan regressions surface immediately instead of on-gallery testing day.
- **Document an HT801 rollback plan.** Auto-provisioning rewrites network/SIP settings but doesn’t record the previous configuration. Capturing a `GET /cgi-bin/api-get_value` dump before changes (and storing it alongside `ht801-config-summary.txt`) would make recovery from partial runs easier.

## Additional Observations

- **HT801 password rotation isn’t idempotent yet.** `ht801-autoprovision.yml` only attempts the factory `admin/admin` login; the follow-up login using the stored password is commented out. Once the password changes, subsequent runs will fail at the very first login unless that secondary path is reinstated.
- **Developer tooling assumptions.** Workflows reference external utilities such as `chokidar` (for watch mode in the README) and `sshpass` (used in `setup-ssh.yml`) without guardrails. Consider adding a short “tooling prerequisites” section or pre-flight check task so newcomers aren’t surprised by missing binaries.
  - Action: yes add this to the documentation.
- **Minor naming inconsistencies.** Variables like `TONE_GENTAL` and the SSH key filename `id_pi5_ainsile_phone` contain typos that leak into docs and configs. Cleaning these up will reduce confusion when searching or scripting around them.
  - **Detailed typos found:**
    - `TONE_GENTAL` → should be `TONE_GENTLE` (4 locations in `extensions.conf.j2`)
      - Line 17: Definition `TONE_GENTAL=442/500,262/100,330/200,220/2000`
      - Lines 46, 91, 126: Usage `Playtones(${TONE_GENTAL})`
    - `id_pi5_ainsile_phone` → should be `id_pi5_ainslie_phone` (2 locations)
      - `group_vars/all.yml:4`: SSH key path definition
      - `inventory/hosts.yml:7`: SSH key path usage
  - **Impact**: SSH key filename change will require coordination with existing deployed systems
  - Action: make a list of the typos, do not fix them yet.
