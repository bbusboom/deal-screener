# Independent hand calc of the Practice deal (Maple Court), no shared code with the site.
def pmt(P, r, n): i=r/12; return P*i/(1-(1+i)**-n)
def irr(c):
    lo,hi=-0.99,1.0
    for _ in range(200):
        m=(lo+hi)/2; v=sum(x/(1+m)**t for t,x in enumerate(c))
        lo,hi=(m,hi) if v>0 else (lo,m)
    return m
price=3_100_000; units=24
gpr=(12*1050+12*1350)*12; other=50*units*12
vac=gpr*0.06; egi=gpr-vac+other
fixed=26000+24000+18000+11000
def yr(t):
    g=1.03**(t-1); G=gpr*g; E=G-G*0.06+other*g
    opex=38000*1.03**(t-1)+19000*1.05**(t-1)+fixed*1.03**(t-1)+300*units*1.03**(t-1)+E*0.05
    return E-opex
loan=price*0.70; m=pmt(loan,0.065,360); ds=m*12
closing=price*0.02; equity=price-loan+closing
# balance after 7 years
i=0.065/12; bal=loan*(1+i)**84 - m*((1+i)**84-1)/i
noi=[yr(t) for t in range(1,9)]
sale=noi[7]/0.065; proceeds=sale*0.98-bal
cfs=[-equity]+[n-ds for n in noi[:7]]; cfs[7]+=proceeds
print(f"NOI y1 {noi[0]:,.0f}  DS {ds:,.0f}  DSCR {noi[0]/ds:.3f}  cap {noi[0]/price*100:.2f}%  CoC {(noi[0]-ds)/equity*100:.2f}%  IRR {irr(cfs)*100:.2f}%  EM {(sum(cfs[1:]))/equity:.2f}")
