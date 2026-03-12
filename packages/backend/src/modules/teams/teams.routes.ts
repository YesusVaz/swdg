import { Router } from 'express';
import { teamController } from './teams.controller';
import { authMiddleware, validate } from '../../middlewares';
import {
  createTeamValidation,
  updateTeamValidation,
  teamIdValidation,
  teamSlugValidation,
  addMemberValidation,
  updateMemberRoleValidation,
  memberIdValidation,
  createRoleValidation,
  updateRoleValidation,
  roleIdValidation,
} from './teams.validation';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ========== TEAMS ==========
router.post(
  '/',
  validate(createTeamValidation),
  teamController.createTeam.bind(teamController)
);

router.get('/', teamController.findAllTeams.bind(teamController));

router.get(
  '/slug/:slug',
  validate(teamSlugValidation),
  teamController.findTeamBySlug.bind(teamController)
);

router.get(
  '/:id',
  validate(teamIdValidation),
  teamController.findTeamById.bind(teamController)
);

router.patch(
  '/:id',
  validate(updateTeamValidation),
  teamController.updateTeam.bind(teamController)
);

router.delete(
  '/:id',
  validate(teamIdValidation),
  teamController.deleteTeam.bind(teamController)
);

// ========== MEMBERS ==========
router.get(
  '/:id/members',
  validate(teamIdValidation),
  teamController.getTeamMembers.bind(teamController)
);

router.post(
  '/:id/members',
  validate(addMemberValidation),
  teamController.addMember.bind(teamController)
);

router.patch(
  '/:id/members/:userId',
  validate(updateMemberRoleValidation),
  teamController.updateMemberRole.bind(teamController)
);

router.delete(
  '/:id/members/:userId',
  validate(memberIdValidation),
  teamController.removeMember.bind(teamController)
);

// ========== ROLES ==========
router.get(
  '/:id/roles',
  validate(teamIdValidation),
  teamController.getTeamRoles.bind(teamController)
);

router.post(
  '/:id/roles',
  validate(createRoleValidation),
  teamController.createRole.bind(teamController)
);

router.patch(
  '/:id/roles/:roleId',
  validate(updateRoleValidation),
  teamController.updateRole.bind(teamController)
);

router.delete(
  '/:id/roles/:roleId',
  validate(roleIdValidation),
  teamController.deleteRole.bind(teamController)
);

export default router;
