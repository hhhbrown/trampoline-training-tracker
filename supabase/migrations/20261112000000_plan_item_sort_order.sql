-- Preserve the existing ID order until a coach explicitly reorders a plan.
alter table public.plan_items
    add column if not exists sort_order integer not null default 0;

create index if not exists plan_items_plan_sort_order_idx
    on public.plan_items (plan_id, sort_order, id);
